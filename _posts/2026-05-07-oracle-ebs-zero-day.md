---
layout: post
title: "Oracle E-Business Suite 제로데이 사건 분석"
date: 2026-05-07
category: "Security"
tags: ["security", "oracle", "zero-day", "ransomware", "CVE-2025-61882"]
excerpt: "2025년 Oracle E-Business Suite 제로데이 공격 사례 분석"
---

# Oracle E-Business Suite 제로데이 사건 분석

## 사건 개요

2025년 10월, Oracle은 Oracle E-Business Suite(EBS)에 영향을 주는 `CVE-2025-61882` 보안 경고를 공개했다. 이 취약점은 Oracle Concurrent Processing의 BI Publisher Integration 구성 요소에 존재하며, 네트워크를 통해 인증 없이 악용될 수 있다.

Oracle 공식 보안 경고에 따르면 영향받는 버전은 `12.2.3`부터 `12.2.14`까지다. CVSS 3.1 점수는 `9.8`이며, 공격자는 HTTP를 통해 인증 없이 Oracle Concurrent Processing을 장악할 수 있다.

CrowdStrike는 이 취약점이 Oracle EBS 애플리케이션을 대상으로 한 대량 악용 캠페인에 사용됐을 가능성이 높다고 분석했다. 목적은 데이터 탈취였고, 일부 활동은 `GRACEFUL SPIDER` 또는 Cl0p 계열 위협 행위자와 연관된 것으로 보고됐다.

## 왜 중요한 사건인가

Oracle EBS는 단순한 웹 애플리케이션이 아니다. 많은 기업에서 재무, 인사, 조달, 주문, 공급망 같은 핵심 업무 데이터를 처리하는 ERP 시스템이다.

따라서 EBS가 침해되면 다음 피해로 이어질 수 있다.

- 임직원 개인정보 탈취
- 재무 및 거래 데이터 유출
- 내부 업무 프로세스 마비
- 탈취 데이터 기반 협박
- 내부망 추가 침투

일반적인 웹 서버 침해보다 위험한 이유는 EBS가 조직 내부의 핵심 업무 데이터와 직접 연결되어 있기 때문이다.

## 공격 흐름

공개 자료를 기준으로 정리하면 공격 흐름은 다음과 같다.

1. 공격자는 인터넷에 노출된 Oracle EBS 인스턴스를 찾는다.
2. `CVE-2025-61882` 취약점을 이용해 인증 없이 원격 코드 실행을 시도한다.
3. 서버에서 명령을 실행하거나 웹 요청을 통해 추가 페이로드를 동작시킨다.
4. Oracle EBS 내부의 민감한 업무 데이터를 조회하거나 탈취한다.
5. 탈취 사실을 근거로 조직에 금전 요구 또는 협박 메일을 보낸다.

Oracle의 IOC에는 의심 IP, 역방향 쉘 명령, 공개된 exploit PoC 관련 해시가 포함됐다. 특히 `sh -c /bin/bash -i ...` 형태의 명령은 공격자가 서버에서 대화형 쉘을 열려고 했다는 점을 보여준다.

## 근본 원인

### 1. 인증 없는 원격 코드 실행

가장 직접적인 원인은 인증 없이 악용 가능한 RCE 취약점이다. 공격자는 계정 정보가 없어도 네트워크 접근만 가능하면 공격을 시도할 수 있었다.

취약점 조건도 위험했다.

- Attack Vector: Network
- Attack Complexity: Low
- Privileges Required: None
- User Interaction: None
- Confidentiality, Integrity, Availability 영향: High

즉, 공격 성공 조건이 낮고 성공 시 영향은 매우 컸다.

### 2. ERP 시스템의 외부 노출

Oracle EBS는 원래 내부 업무 시스템 성격이 강하다. 그런데 원격 근무, 협력사 연동, 운영 편의성 때문에 인터넷 또는 넓은 네트워크 구간에 노출되는 경우가 있다.

인증 없는 RCE가 있는 상태에서 EBS가 외부에 노출되면 패치 전까지 방어 시간이 거의 없다.

### 3. 패치 선행 조건

Oracle은 보안 경고에서 2023년 10월 Critical Patch Update가 이번 패치 적용의 선행 조건이라고 밝혔다. 이는 오래된 패치 수준에 머물러 있던 조직이 긴급 패치를 바로 적용하기 어려웠을 수 있다는 뜻이다.

운영 시스템에서 ERP 패치는 테스트와 다운타임 조율이 필요하다. 이 때문에 패치 지연이 누적되면 실제 제로데이 상황에서 대응 속도가 크게 떨어진다.

## 대응 방법

### Oracle의 대응

Oracle은 2025년 10월 4일 보안 경고를 공개하고 패치를 제공했다. 이후 10월 6일에는 IOC 표를 명확히 하는 업데이트를 냈다.

공식 권고의 핵심은 다음과 같다.

- 영향받는 EBS 버전에 보안 패치 적용
- 지원 중인 버전 유지
- Critical Patch Update 지연 없이 적용
- Oracle이 제공한 IOC 기반 탐지와 헌팅 수행

### 조직이 해야 할 대응

영향받는 조직은 단순히 패치만 적용하면 안 된다. 이미 악용된 취약점이기 때문에 침해 여부를 같이 확인해야 한다.

우선순위는 다음과 같다.

1. 인터넷에 노출된 Oracle EBS 인스턴스 식별
2. 영향 버전 여부 확인
3. Oracle 보안 패치 적용
4. 웹 로그, EBS 로그, OS 명령 실행 흔적 점검
5. Oracle IOC와 일치하는 IP, 파일, 명령어 확인
6. 의심 계정과 세션 폐기
7. 탈취 가능성이 있는 데이터 범위 산정
8. 내부망 lateral movement 여부 조사

## 보완이 미흡했던 부분

### 패치 관리의 누적 부채

이번 패치는 과거 Critical Patch Update 적용 여부에 영향을 받았다. 보안 패치를 몇 달 또는 몇 년 미루면 긴급 상황에서 바로 대응할 수 없다.

ERP 시스템은 안정성이 중요하지만, 그 이유로 패치가 계속 밀리면 더 큰 사고로 이어진다.

### 외부 노출 통제 부족

인증 없는 RCE 취약점은 외부 노출 여부가 피해 규모를 크게 좌우한다. EBS 관리 화면이나 업무 기능이 인터넷에서 직접 접근 가능했다면 공격 표면이 너무 넓었다고 볼 수 있다.

가능하면 VPN, ZTNA, IP allowlist, WAF, 네트워크 분리로 접근 범위를 줄여야 한다.

### 로그 기반 탐지 부족

Oracle이 IOC를 제공했다는 것은 조직 내부에서 탐지할 수 있는 흔적이 있다는 뜻이다. 하지만 평소에 로그 수집, 보존, 검색 체계가 없으면 사고 후에도 침해 여부를 판단하기 어렵다.

ERP 보안은 패치만이 아니라 로그 보존과 위협 헌팅까지 포함해야 한다.

## 배운 점

이 사건의 핵심은 "중요 시스템일수록 패치와 노출 관리가 더 엄격해야 한다"는 점이다.

Oracle EBS 같은 ERP는 공격자가 노리는 가치가 크다. 취약점 하나가 단순 서버 침해가 아니라 재무, 인사, 고객, 협력사 데이터 유출로 이어질 수 있다.

따라서 다음 기준이 필요하다.

- 외부 노출된 ERP 자산 목록을 항상 최신으로 유지한다.
- Critical Patch Update를 정기적으로 적용한다.
- 긴급 패치를 위한 테스트 절차를 미리 마련한다.
- ERP 로그를 중앙 SIEM으로 수집한다.
- 인증 없는 접근이 가능한 경로를 최소화한다.
- 핵심 업무 시스템에는 WAF와 네트워크 접근 제어를 적용한다.

## 참고 자료

- [Oracle Security Alert Advisory - CVE-2025-61882](https://www.oracle.com/security-alerts/alert-cve-2025-61882.html)
- [CrowdStrike - Oracle EBS zero-day CVE-2025-61882 campaign](https://www.crowdstrike.com/en-us/blog/crowdstrike-identifies-campaign-targeting-oracle-e-business-suite-zero-day-CVE-2025-61882/)
- [Rapid7 - CVE-2025-61882 critical 0day in Oracle EBS](https://www.rapid7.com/blog/post/etr-cve-2025-61882-critical-0day-in-oracle-e-business-suite-exploited-in-the-wild/)
- [Oracle October 2025 Critical Patch Update](https://www.oracle.com/uk/security-alerts/cpuoct2025.html)
