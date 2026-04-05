---
layout: post
title: CTF 기초 개념과 풀이 전략
date: 2024-04-04
category: CTF/Wargame
tags: [CTF, 해킹, 보안, 학습]
author: 블로거
excerpt: CTF(Capture The Flag) 대회에 참여하기 위한 기초 개념과 각 카테고리별 풀이 전략을 소개합니다.
---

CTF(Capture The Flag)에 입문하려는 분들을 위한 가이드입니다.

## 🚩 CTF란?

CTF는 **Capture The Flag**의 약자로, 컴퓨터 보안 실력을 겨루는 대회입니다. 여러 분야의 보안 문제를 푸는 경쟁입니다.

## 📚 주요 카테고리

### 1. **Forensics** (포렌식)
디지털 증거에서 플래그를 찾아내는 분야입니다.

```bash
# 파일의 숨겨진 정보 확인
file evidence.img
hexdump -C evidence.img | grep -i flag

# EXIF 정보 확인
exiftool photo.jpg
```

### 2. **Cryptography** (암호화)
암호화된 메시지를 복호화하여 플래그를 찾습니다.

```python
# 간단한 시저 암호 풀기
def caesar_decrypt(text, shift):
    result = ""
    for char in text:
        if char.isalpha():
            result += chr((ord(char) - ord('A') - shift) % 26 + ord('A'))
        else:
            result += char
    return result
```

### 3. **Steganography** (스테가노그래피)
파일에 숨겨진 정보를 찾아내는 분야입니다.

```bash
# 이미지에서 숨겨진 정보 추출
steghide extract -sf image.jpg
strings image.jpg | grep -i flag
```

### 4. **Web Exploitation** (웹 보안)
웹 애플리케이션의 취약점을 이용합니다.

```bash
# SQL Injection 테스트
curl "http://target.com/?id=1' OR '1'='1"

# XSS 페이로드
<script>alert('XSS')</script>
```

### 5. **Reverse Engineering** (리버스 엔지니어링)
컴파일된 바이너리를 분석합니다.

```bash
# 바이너리 분석
objdump -d binary
strings binary | grep flag

# GDB로 디버깅
gdb ./binary
(gdb) break main
(gdb) run
```

## 🛠️ 필수 도구

| 도구 | 용도 |
|------|------|
| Wireshark | 네트워크 패킷 분석 |
| Ghidra | 리버스 엔지니어링 |
| Burp Suite | 웹 보안 테스트 |
| pwntools | 익스플로잇 개발 |
| Metasploit | 취약점 테스트 |

## 💡 풀이 팁

1. **문제 분석**: 주어진 파일과 설명을 충분히 읽기
2. **온라인 리소스**: Google, GitHub, StackOverflow 활용
3. **커뮤니티**: CTF 포럼과 Slack 채널 참여
4. **기록**: 풀이 과정 기록하기
5. **연습**: 과거 대회 문제로 연습

## 🎯 학습 로드맵

```
기초 개념 학습
    ↓
온라인 CTF 참여 (PicoCTF, OverTheWire)
    ↓
과거 문제 풀이
    ↓
실제 대회 참여
```

## 📖 추천 리소스

- 🌐 [PicoCTF](https://picoctf.com/)
- 🌐 [OverTheWire](https://overthewire.org/)
- 🌐 [HackTheBox](https://www.hackthebox.com/)
- 📚 [정보보안개론](https://example.com)

다음 포스트에서는 구체적인 문제 풀이를 다루겠습니다!
