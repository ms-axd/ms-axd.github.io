---
layout: post
title: "Salesforce OAuth Token 탈취 사건 분석"
date: 2026-05-07
category: "Security"
tags: ["security", "salesforce", "oauth", "token", "SaaS", "Salesloft"]
excerpt: "2025년 Salesloft Drift 연동을 통한 Salesforce OAuth Token 탈취 사건 분석"
---

# Salesforce OAuth Token 탈취 사건 분석

## 사건 개요

2025년 8월, Google Threat Intelligence Group(GTIG)은 `UNC6395`로 추적되는 위협 행위자가 Salesloft Drift 타사 애플리케이션과 관련된 OAuth 토큰을 악용해 여러 기업의 Salesforce 인스턴스에서 데이터를 탈취했다고 공개했다.

공격 기간은 2025년 8월 8일부터 적어도 8월 18일까지로 보고됐다. 공격자는 Salesforce 자체 취약점을 이용한 것이 아니라, Salesloft Drift 연동에 사용되던 OAuth access token과 refresh token을 훔쳐 정상 연동처럼 Salesforce API에 접근했다.

GTIG는 이 사건의 주요 목적을 credential harvesting으로 판단했다. 공격자는 Salesforce에서 대량 데이터를 내보낸 뒤 그 안에서 AWS access key, 비밀번호, Snowflake token 같은 추가 비밀 정보를 찾았다.

## 왜 중요한 사건인가

이 사건은 SaaS 보안에서 중요한 문제를 보여준다.

MFA를 켜도 OAuth token이 탈취되면 공격자는 사용자 로그인 과정을 거치지 않고 API로 접근할 수 있다. 즉, 정상 사용자가 이미 승인한 연동 앱의 권한이 공격자의 우회 경로가 된다.

Salesforce에는 보통 다음 데이터가 저장된다.

- 고객 연락처
- 영업 기회
- 지원 케이스
- 계약 관련 메타데이터
- 내부 운영 메모
- 고객이 실수로 남긴 계정 정보 또는 API 키

따라서 CRM 데이터 유출은 단순 개인정보 유출을 넘어 후속 phishing, 거래처 사칭, 클라우드 계정 침해로 이어질 수 있다.

## 공격 흐름

공개 자료를 기준으로 정리하면 공격 흐름은 다음과 같다.

1. 공격자는 Salesloft 또는 Drift 관련 환경에 접근한다.
2. Drift와 Salesforce 등 외부 서비스 연동에 사용되는 OAuth token을 확보한다.
3. 훔친 token으로 Salesforce 고객 인스턴스에 API 접근한다.
4. `Account`, `User`, `Case`, `Opportunity` 같은 객체를 조회한다.
5. 대량 데이터를 내보낸다.
6. 유출 데이터에서 AWS key, password, Snowflake token 같은 비밀 정보를 검색한다.
7. 탐지를 어렵게 하기 위해 일부 query job 기록을 삭제한다.

중요한 점은 공격자가 Salesforce 로그인 페이지를 뚫은 것이 아니라는 점이다. 이미 승인된 OAuth 연동 권한을 재사용했다.

## 근본 원인

### 1. OAuth token의 높은 권한

OAuth token은 비밀번호가 아니지만 실제로는 API 접근 권한을 가진다. 특히 refresh token까지 탈취되면 access token을 계속 재발급받을 수 있다.

연동 앱에 넓은 scope가 부여되어 있었다면 공격자는 많은 Salesforce 객체를 조회할 수 있다.

문제는 다음과 같다.

- token이 장기간 유효하다.
- 연동 앱 scope가 넓다.
- IP 제한이 약하다.
- token 사용 위치가 평소와 달라도 탐지하지 못한다.
- third-party app의 보안 상태를 고객사가 직접 확인하기 어렵다.

### 2. SaaS 연동 신뢰의 남용

기업은 업무 자동화를 위해 SaaS끼리 연결한다. Drift는 고객 상담과 영업 흐름을 Salesforce와 동기화할 수 있다. 이 구조는 편리하지만, 하나의 SaaS가 침해되면 연결된 다른 SaaS까지 영향을 받는다.

이번 사건은 "우리 Salesforce가 안전하다"만으로 충분하지 않다는 점을 보여준다. Salesforce에 연결된 외부 앱의 토큰, 권한, 보관 방식까지 보안 범위에 포함해야 한다.

### 3. 민감 정보가 CRM에 저장됨

공격자는 Salesforce 데이터를 탈취한 뒤 그 안에서 credential을 찾았다. 이는 지원 케이스나 메모에 고객이 비밀번호, API key, Snowflake token, AWS key를 남기는 경우가 있기 때문이다.

CRM은 원래 비밀 정보 저장소가 아니다. 하지만 실제 운영에서는 지원 편의를 이유로 민감 정보가 들어가는 경우가 많다.

## 대응 방법

### Salesloft, Salesforce, Google의 대응

GTIG에 따르면 2025년 8월 20일 Salesloft는 Salesforce와 협력해 Drift 애플리케이션의 활성 access token과 refresh token을 모두 취소했다. Salesforce는 추가 조사가 진행되는 동안 Drift 앱을 AppExchange에서 제거했다.

Google, Salesforce, Salesloft는 영향을 받은 조직에 통지했다.

이후 권고된 주요 대응은 다음과 같다.

- Drift와 연결된 모든 third-party integration 검토
- 연결된 애플리케이션의 token 취소 및 재발급
- Salesforce Event Monitoring 로그 검토
- Drift Connected App 인증 활동 확인
- SOQL query 기록 확인
- Salesforce 객체 안에 남아 있는 secret 검색
- 발견된 secret 즉시 폐기 및 교체

### 조직이 해야 할 대응

영향받은 조직은 단순히 Drift 연결을 끊는 것에서 끝내면 안 된다. 이미 Salesforce 데이터가 유출됐을 수 있으므로 데이터 안의 secret까지 확인해야 한다.

우선순위는 다음과 같다.

1. Drift, Salesloft, Salesforce 연동 상태 확인
2. Drift 관련 OAuth token과 API key 폐기
3. Salesforce connected app 권한 검토
4. Salesforce Event Monitoring, LoginEvent, ApiEvent, BulkApi 로그 확인
5. 대량 query, 대량 export, 비정상 IP 접근 확인
6. Case, Account, User, Opportunity 객체에서 secret 검색
7. 노출 가능성이 있는 AWS, Snowflake, VPN, SSO, API key 회전
8. 고객 지원 케이스에 민감 정보가 포함됐는지 점검
9. 후속 phishing과 social engineering 대비

## 보완이 미흡했던 부분

### third-party integration 관리 부족

SaaS 연동 앱은 설치 후 잊히기 쉽다. 하지만 실제로는 지속적인 API 접근 권한을 가진다.

정기적으로 확인해야 할 항목은 다음과 같다.

- 어떤 앱이 연결되어 있는가
- 어떤 사용자가 승인했는가
- 어떤 scope를 갖고 있는가
- refresh token이 유효한가
- 최근 사용 IP와 위치가 정상인가
- 더 이상 쓰지 않는 앱이 남아 있는가

### OAuth token 사용 탐지 부족

정상 OAuth token으로 API를 호출하면 일반 로그인 실패나 MFA 우회 이벤트가 남지 않을 수 있다. 그래서 token replay 탐지가 필요하다.

예를 들어 다음 신호를 봐야 한다.

- 평소와 다른 ASN 또는 국가에서 API 호출
- 특정 connected app의 갑작스러운 대량 query
- 짧은 시간 내 Bulk API export 증가
- 같은 token 또는 integration user의 비정상 User-Agent
- query job 삭제 흔적

### CRM 내 secret 저장 통제 부족

지원 케이스에 비밀번호나 API key가 들어가면 CRM 침해가 곧 다른 시스템 침해로 이어진다.

조직은 CRM 필드와 첨부파일에 secret scanning을 적용해야 한다. 또한 고객과 내부 직원에게 비밀 정보를 CRM이나 티켓에 직접 남기지 않도록 정책을 정해야 한다.

## 배운 점

이 사건의 핵심은 "토큰은 비밀번호와 같은 수준으로 보호해야 한다"는 점이다.

OAuth token은 사용자가 직접 입력하는 비밀번호가 아니기 때문에 보안 검토에서 가볍게 다뤄지는 경우가 있다. 하지만 실제 권한은 매우 크다. 특히 SaaS 연동 token은 MFA를 우회하는 합법적 API 통로가 될 수 있다.

방어 원칙은 다음과 같다.

- connected app 권한을 최소화한다.
- refresh token 수명과 재사용 조건을 제한한다.
- IP restriction을 강제한다.
- SaaS API 로그를 중앙에서 수집한다.
- integration user를 일반 사용자와 분리한다.
- 대량 export 탐지 규칙을 만든다.
- CRM과 support case에 secret scanning을 적용한다.
- third-party SaaS 사고 발생 시 연결된 모든 token을 회전한다.

## 참고 자료

- [Google Cloud - Salesforce 인스턴스를 노린 대규모 데이터 도난: Salesloft Drift 공격 분석](https://cloud.google.com/blog/ko/topics/threat-intelligence/data-theft-salesforce-instances-via-salesloft-drift)
- [Google Cloud - UNC6040 Proactive Hardening Recommendations](https://cloud.google.com/blog/topics/threat-intelligence/unc6040-proactive-hardening-recommendations)
- [Salesforce Help - OAuth Access Tokens](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_access_tokens.htm&language=en_US)
- [Salesforce Help - Revoke OAuth Tokens Programmatically](https://help.salesforce.com/s/articleView?id=xcloud.remoteaccess_revoke_token.htm&language=en_US&type=5)
- [Cybersecurity News - Salesloft Drift cyberattack linked to GitHub compromise and OAuth token theft](https://cybersecuritynews.com/salesloft-drift-cyberattack/)
