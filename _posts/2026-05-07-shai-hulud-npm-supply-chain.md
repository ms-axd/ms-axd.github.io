---
layout: post
title: "Shai-Hulud npm 공급망 공격 분석"
date: 2026-05-07
category: "Security"
tags: ["security", "npm", "supply chain", "malware", "Shai-Hulud"]
excerpt: "2025년 Shai-Hulud npm 공급망 공격 사례 분석"
---

# Shai-Hulud npm 공급망 공격 분석

## 사건 개요

Shai-Hulud는 2025년 npm 생태계에서 발생한 대규모 공급망 공격이다. 공격자는 npm maintainer 계정과 토큰을 탈취한 뒤 정상 패키지에 악성 코드를 삽입해 배포했다.

이 공격의 특징은 단순한 악성 패키지 배포가 아니라 자기 복제 구조를 가졌다는 점이다. 감염된 패키지가 설치되면 개발자 PC나 CI/CD 환경에서 비밀 정보를 훔치고, 탈취한 npm 토큰으로 같은 maintainer가 관리하는 다른 패키지까지 다시 감염시킬 수 있었다.

CISA는 2025년 9월 23일 npm 생태계의 광범위한 공급망 침해 경고를 발표했고, 공개적으로 `Shai-Hulud`로 알려진 자기 복제 worm이 500개 이상의 패키지를 침해했다고 설명했다.

## 왜 중요한 사건인가

npm 패키지는 웹 서비스, 프론트엔드, 백엔드, 빌드 도구, 서버리스 환경까지 넓게 사용된다. 개발자는 보통 유명 패키지를 신뢰하고 설치한다.

공격자는 이 신뢰를 악용했다.

- 사용자는 정상 패키지를 설치했다고 생각한다.
- 실제로는 악성 postinstall 또는 preinstall 스크립트가 실행된다.
- 개발자 PC와 CI/CD 환경의 토큰이 유출된다.
- 유출된 토큰으로 다른 패키지가 다시 감염된다.

즉, 피해는 패키지 사용자 한 명에서 끝나지 않고 maintainer, GitHub 저장소, 클라우드 계정, 배포 파이프라인으로 확산될 수 있다.

## 공격 흐름

공개 분석을 기준으로 공격 흐름은 다음과 같다.

1. 공격자는 npm maintainer 계정 또는 npm 토큰을 탈취한다.
2. 정상 npm 패키지의 새 버전에 악성 install script를 삽입한다.
3. 사용자가 해당 버전을 설치하면 악성 스크립트가 실행된다.
4. 스크립트는 환경 변수, 설정 파일, GitHub 토큰, npm 토큰, 클라우드 키를 검색한다.
5. 탈취한 비밀 정보를 외부로 유출하거나 공개 GitHub 저장소에 업로드한다.
6. 탈취한 npm 토큰으로 다른 정상 패키지에 악성 버전을 게시한다.
7. 감염 범위가 자동으로 확산된다.

Unit 42와 StepSecurity 분석에 따르면 Shai-Hulud는 TruffleHog 같은 secret scanning 도구를 활용해 AWS, GCP, Azure, GitHub, npm 관련 비밀 정보를 찾았다. 일부 변종은 GitHub Actions workflow를 만들어 지속성을 확보하려고 했다.

## Shai-Hulud 2.0

2025년 11월에는 Shai-Hulud 2.0 또는 `Sha1-Hulud: The Second Coming`으로 불리는 후속 캠페인이 보고됐다.

기존 공격과 비교해 다음 차이가 있었다.

- `postinstall`보다 더 이른 단계인 `preinstall`에서 실행
- `setup_bun.js`, `bun_environment.js` 같은 새 payload 사용
- 수만 개 GitHub 저장소에 영향
- 비밀 정보 탈취 실패 시 사용자 홈 디렉터리 삭제를 시도하는 파괴적 동작
- 공개 GitHub 저장소를 이용한 비밀 정보 노출

이는 공격자가 단순 토큰 탈취에서 더 공격적인 파괴와 지속성 확보로 이동했다는 신호다.

## 근본 원인

### 1. maintainer 계정과 토큰에 대한 과도한 신뢰

npm 패키지 배포는 maintainer 계정과 토큰에 크게 의존한다. 이 계정이 탈취되면 공격자는 정상 패키지의 정상 버전처럼 악성 코드를 배포할 수 있다.

사용자 입장에서는 패키지 이름도 정상이고, publisher도 정상으로 보인다. 그래서 탐지가 어렵다.

### 2. 장기 토큰과 넓은 권한

장기 npm 토큰이나 GitHub PAT가 개발자 PC 또는 CI 환경에 저장되어 있으면 공격자는 이를 훔쳐 재사용할 수 있다.

문제는 토큰이 다음 특징을 갖는 경우다.

- 만료 기간이 길다.
- 여러 패키지에 publish 권한이 있다.
- IP, 환경, workflow 제한이 없다.
- 유출 후 자동 폐기되지 않는다.

이런 토큰은 공격자에게 공급망 전체를 오염시킬 수 있는 권한을 준다.

### 3. install script의 위험성

npm은 패키지 설치 과정에서 `preinstall`, `install`, `postinstall` 같은 lifecycle script를 실행할 수 있다. 정상적으로는 native build, setup, code generation에 유용하다.

하지만 공격자가 이 기능을 악용하면 패키지 설치만으로 임의 코드 실행이 가능하다.

개발자 PC와 CI/CD runner는 보통 많은 비밀 정보를 갖고 있다. 그래서 install script 악용은 단순 악성코드 실행보다 더 위험하다.

## 대응 방법

### GitHub와 npm의 대응

GitHub는 Shai-Hulud 공격 대응으로 500개 이상의 침해 패키지를 npm registry에서 제거했다고 밝혔다. 또한 npm 공급망 보안을 강화하기 위해 다음 방향을 제시했다.

- 더 엄격한 인증
- granular token 강화
- trusted publishing 확대
- classic token과 취약한 인증 방식 축소

이 대응은 패키지 배포 권한을 장기 비밀 토큰에 의존하지 않도록 바꾸는 방향이다.

### 조직과 개발자가 해야 할 대응

감염 가능성이 있는 패키지를 설치한 조직은 개발자 PC와 CI/CD 환경을 모두 잠재적 침해 대상으로 봐야 한다.

우선순위는 다음과 같다.

1. affected package와 설치 시점 확인
2. npm lockfile과 CI 로그 점검
3. GitHub PAT, npm token, cloud key 전부 회전
4. CI/CD secret 재발급
5. 공개 GitHub 저장소에 secret이 노출됐는지 확인
6. 의심 GitHub Actions workflow 제거
7. npm package publish 권한 점검
8. 패키지 버전 pinning과 provenance 확인

## 보완이 미흡했던 부분

### 자동 업데이트의 위험 관리 부족

많은 프로젝트가 dependency update를 자동화한다. 자동화 자체는 필요하지만, install script가 있는 패키지까지 무검증으로 받아들이면 위험하다.

특히 CI에서 자동으로 `npm install`을 수행하고, 동시에 배포 토큰과 클라우드 키를 가진 경우 피해가 커진다.

### secret 관리 부족

비밀 정보가 개발자 PC, `.npmrc`, 환경 변수, CI 로그, 오래된 GitHub token에 흩어져 있으면 공격자는 secret scanner로 쉽게 찾을 수 있다.

비밀 정보는 최소 권한, 짧은 수명, 환경 제한, 자동 회전이 필요하다.

### 패키지 설치 단계의 격리 부족

패키지 설치는 빌드의 일부지만 실제로는 코드 실행이다. 그런데 많은 조직이 설치 단계를 신뢰된 작업으로 취급한다.

CI에서는 install 단계와 publish/deploy 단계를 분리하고, 설치 단계에는 중요한 토큰을 주지 않는 구조가 필요하다.

## 배운 점

Shai-Hulud 사건의 핵심은 "오픈소스 패키지 설치도 코드 실행"이라는 점이다.

공급망 공격을 줄이려면 다음 원칙이 필요하다.

- npm token은 짧은 수명과 최소 권한으로 운영한다.
- trusted publishing을 우선 사용한다.
- CI install 단계에는 배포 권한을 주지 않는다.
- `npm install --ignore-scripts` 적용 가능성을 검토한다.
- lockfile 변경을 코드 리뷰 대상으로 본다.
- dependency update는 자동 병합하지 않는다.
- GitHub secret scanning과 push protection을 켠다.
- 의심 사고 후에는 패키지만 지우지 말고 토큰을 모두 회전한다.

## 참고 자료

- [CISA - Widespread Supply Chain Compromise Impacting npm Ecosystem](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem)
- [GitHub Blog - Our plan for a more secure npm supply chain](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/)
- [StepSecurity - Shai-Hulud: Self-Replicating Worm Compromises 500+ NPM Packages](https://www.stepsecurity.io/blog/ctrl-tinycolor-and-40-npm-packages-compromised)
- [Palo Alto Networks Unit 42 - Shai-Hulud Worm Compromises npm Ecosystem](https://unit42.paloaltonetworks.com/npm-supply-chain-attack/)
- [Microsoft Security Blog - Shai-Hulud 2.0 guidance](https://www.microsoft.com/en-us/security/blog/2025/12/09/shai-hulud-2-0-guidance-for-detecting-investigating-and-defending-against-the-supply-chain-attack/)
