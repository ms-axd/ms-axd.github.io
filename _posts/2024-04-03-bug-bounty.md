---
layout: post
title: 버그 바운티 프로그램 시작하기
date: 2024-04-03
category: BugBounty
tags: [버그바운티, 보안, 취약점, 수익]
author: 블로거
excerpt: 버그 바운티 프로그램에 참여하여 수익을 얻고 경험을 쌓는 방법을 소개합니다.
---

버그 바운티는 기업의 보안 취약점을 찾아 신고하고 보상을 받는 활동입니다.

## 💰 버그 바운티란?

기업들은 자신들의 시스템에서 취약점을 먼저 찾아서 알려주는 보안 연구자들에게 보상금을 지급합니다.

## 🌐 주요 플랫폼

### 1. **HackerOne**
- 2,500개 이상의 프로그램 운영
- 평균 보상금: $500~$5,000
- 글로벌 최대 규모

### 2. **Bugcrowd**
- 1,500개 이상의 프로그램
- 보상금 범위: $100~$10,000+
- 한국 기업 프로그램도 많음

### 3. **Intigriti**
- 유럽 기반 플랫폼
- 높은 보상금 제공
- 상대적으로 경쟁이 적음

## 🔍 취약점 찾기 팁

### 1. **Recon** (정보 수집)
```bash
# 도메인 정보 확인
whois target.com

# 하위도메인 발견
amass enum -d target.com

# 포트 스캔
nmap -p- target.com
```

### 2. **일반적인 취약점**
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Authentication Bypass
- Insecure Direct Object Reference (IDOR)
- Server-Side Request Forgery (SSRF)
- Remote Code Execution (RCE)

### 3. **보안 설정 확인**
```bash
# SSL/TLS 점수 확인
curl -I https://target.com

# 보안 헤더 확인
curl -I https://target.com | grep -i "security\|x-\|cache"
```

## 📝 취약점 보고서 작성

좋은 보고서의 요소:

```
제목: 명확하고 구체적으로
영향도: High, Medium, Low
재현 방법: 단계별로 상세히
스크린샷: 증거 제시
수정 방안: 제안하면 좋음
```

## 💡 성공 비결

1. **꾸준함**: 매일 연습하기
2. **세심함**: 디버그 창에서 놓친 부분 찾기
3. **문서화**: 재현 과정을 명확히 기록
4. **윤리**: 절대 데이터 탈취하지 않기
5. **소통**: 프로그램 매니저와 좋은 관계 유지

## 🎯 첫 보상을 받기 위한 로드맵

```
1주차: 플랫폼 가입 및 프로필 작성
2주차: 온라인 보안 커스 학습
3주차: Private 프로그램에서 연습
4주차: 첫 취약점 발견
5주차: 첫 보상 수령 🎉
```

## ⚠️ 주의사항

- ✅ 프로그램 범위 내에서만 테스트
- ✅ 데이터 접근하지 않기
- ✅ DoS 공격 금지
- ✅ 발견 전까지 다른 곳에 알리지 않기
- ❌ 개인정보 탈취 금지
- ❌ 범위 밖 서버 공격 금지

## 📚 학습 리소스

- HackerOne Academy
- Bugcrowd University
- OWASP Top 10
- PortSwigger Web Security Academy

버그 바운티로 수익을 얻으면서 보안 실력을 키워보세요! 💪
