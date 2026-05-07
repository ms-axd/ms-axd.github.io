---
layout: post
title: "Microsoft Midnight Blizzard 침해사고 분석"
date: 2026-05-07
category: "블로그/기술문서"
tags: ["보안사고", "Microsoft", "Midnight Blizzard", "NOBELIUM", "password-spray"]
excerpt: "Microsoft Midnight Blizzard 침해사고"
---

# Microsoft Midnight Blizzard 침해사고 분석

## 사건 개요

Microsoft는 2024년 1월 12일 기업 시스템에 대한 국가 배후 공격을 탐지했고, 2024년 1월 19일 Midnight Blizzard 공격 사실을 공개했다. Midnight Blizzard는 NOBELIUM, APT29, Cozy Bear로도 불리는 러시아 연계 국가 배후 위협 행위자다.

이 사건은 엄밀히 말하면 2026년 5월 기준 최근 1년 내 사고는 아니다. 그러나 대형 클라우드 기업의 계정 관리 실패, 레거시 테넌트, OAuth 앱 악용, 이메일과 소스코드 접근으로 이어진 대표 사례라 보안 사고 분석 대상으로 가치가 크다.

공격자는 2023년 11월 말부터 비밀번호 스프레이 공격을 수행했고, MFA가 적용되지 않은 레거시 비운영 테스트 테넌트 계정을 탈취했다. 이후 해당 계정 권한을 이용해 Microsoft 임원진, 보안, 법무 등 일부 기업 이메일 계정에 접근하고 이메일과 첨부파일 일부를 탈취했다. 2024년 3월 Microsoft는 공격자가 탈취한 정보를 이용해 소스코드 저장소와 내부 시스템에도 접근했거나 접근을 시도했다고 추가로 밝혔다.

## 주요 타임라인

- 2023년 11월 말: 공격자가 비밀번호 스프레이 공격 시작
- 2024년 1월 12일: Microsoft 보안팀이 공격 탐지
- 2024년 1월 19일: Microsoft가 Midnight Blizzard 침해 사실 공개
- 2024년 1월 25일: Microsoft가 대응자용 기술 분석과 탐지 지침 공개
- 2024년 3월 8일: 탈취 이메일 정보를 이용한 추가 접근 시도와 소스코드 저장소 접근 사실 공개
- 2024년 5월 3일: Microsoft가 Secure Future Initiative 확대 발표

## 근본 원인 분석

첫째, MFA가 없는 레거시 테스트 계정이 초기 침투 지점이었다. 공격자는 많은 계정에 적은 수의 흔한 비밀번호를 시도하는 비밀번호 스프레이 방식을 사용했다. 낮은 빈도와 분산된 주거용 프록시 인프라를 이용해 탐지를 회피했다.

둘째, 비운영 테스트 테넌트가 충분히 격리되지 않았다. 테스트 계정이 실제 기업 이메일 접근으로 이어질 수 있었다는 점은 비운영 환경의 권한과 신뢰 경계가 과도했다는 의미다. 테스트 환경은 기능상 편의 때문에 보안 예외가 생기기 쉽지만, 공격자는 바로 그 예외를 노린다.

셋째, OAuth 애플리케이션 권한이 악용됐다. 공격자는 탈취 계정의 권한을 이용해 악성 OAuth 앱을 만들거나 기존 권한 구조를 활용해 이메일에 접근했다. 이는 계정 비밀번호 보호만으로는 부족하며 앱 권한, 토큰, 동의 흐름까지 관리해야 함을 보여준다.

넷째, 이메일에 포함된 비밀정보가 2차 공격 재료가 됐다. Microsoft는 공격자가 탈취한 이메일에서 발견한 여러 종류의 비밀정보를 사용해 고객과 Microsoft 간 공유된 정보, 내부 시스템, 소스코드 저장소에 접근하려 했다고 밝혔다. 이메일은 단순 커뮤니케이션 도구가 아니라 비밀정보 저장소가 될 수 있다.

## 대응 방법

Microsoft는 탐지 후 즉시 대응 절차를 가동해 공격 활동을 조사, 차단, 완화했다고 밝혔다. 이후 고객과 공개 블로그를 통해 침해 사실과 기술 정보를 공유했다. 대응자용 안내에서는 비밀번호 스프레이 탐지, OAuth 앱 악용 탐지, 의심 로그인 확인, 토큰과 앱 권한 점검을 강조했다.

2024년 5월에는 Secure Future Initiative를 확대했다. 주요 방향은 피싱 저항 MFA 확대, 시스템 관리 자격증명 사용, 토큰 검증 강화, 레거시 시스템 제거, 모든 테넌트에 보안 기준 적용, 보안 성과를 경영진 평가와 보상에 반영하는 것이다.

## 미흡했던 부분

첫째, 레거시 테스트 계정에 MFA가 없었다. 대형 클라우드 기업도 예외 계정이 남아 있으면 공격자는 그 계정을 통해 들어온다.

둘째, 테스트 테넌트와 기업 핵심 자산 사이의 격리가 충분하지 않았다. 비운영 환경은 운영 환경보다 낮은 신뢰를 가져야 한다.

셋째, OAuth 앱과 권한 동의 흐름에 대한 통제가 충분하지 않았다. 공격자는 계정 탈취 후 토큰과 앱 권한을 이용해 지속 접근을 만들 수 있다.

넷째, 이메일 내 비밀정보 관리가 미흡했다. 이메일에 자격증명, 토큰, 내부 시스템 정보가 남아 있으면 계정 침해가 곧 추가 침해로 확장된다.

다섯째, 탐지까지 시간이 걸렸다. 2023년 11월 말 시작된 활동이 2024년 1월 12일 탐지됐다. 낮은 빈도의 분산 공격을 탐지할 수 있는 행위 기반 분석이 더 강했어야 한다.

## 재발 방지 대책

- 모든 계정에 피싱 저항 MFA 적용
- 레거시 계정과 미사용 테넌트 제거
- 비운영 테넌트의 권한과 신뢰 관계 최소화
- OAuth 앱 생성, 권한 부여, 동의 흐름에 대한 승인 체계 운영
- 이메일과 협업 도구에 비밀정보 저장 금지
- 비밀정보 탐지 도구로 메일, 문서, 저장소를 정기 검사
- 비밀번호 스프레이 탐지를 실패 횟수뿐 아니라 분산 IP, 장기 저빈도 패턴 기준으로 수행
- 소스코드 저장소 접근에 조건부 접근과 세분화된 권한 적용

## 결론

Midnight Blizzard 사고의 본질은 고급 공격자가 복잡한 제로데이를 썼다는 것이 아니다. 방치된 레거시 계정, MFA 예외, 비운영 환경의 과한 권한, 이메일 속 비밀정보가 결합되면서 대형 기업의 핵심 자산까지 위험해졌다. 가장 중요한 교훈은 `보안 예외는 시간이 지나면 공격 표면이 된다`는 점이다.

## 참고 자료

- [Microsoft MSRC, Actions Following Attack by Nation State Actor Midnight Blizzard](https://www.microsoft.com/en-us/msrc/blog/2024/01/microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard)
- [Microsoft Security Blog, Midnight Blizzard guidance for responders](https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/)
- [Microsoft MSRC, March 2024 update on Midnight Blizzard](https://www.microsoft.com/en-us/msrc/blog/2024/03/update-on-microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard)
- [Microsoft Security Blog, Expanding Secure Future Initiative](https://www.microsoft.com/en-us/security/blog/2024/05/03/security-above-all-else-expanding-microsofts-secure-future-initiative/)
