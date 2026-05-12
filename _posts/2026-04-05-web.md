---
layout: post
title: 웹 개발 기초 개념 정리
date: 2026-04-05
category: 개발
tags: [웹개발, HTML, CSS, JavaScript, 기초]
excerpt: 웹 개발을 시작하는 분들을 위한 HTML, CSS, JavaScript의 기본 개념과 각각의 역할을 정리했습니다.
---


## 🌐 웹 개발의 3 요소

웹 개발은 크게 세 가지 기술로 이루어져 있습니다.

### 1. HTML (HyperText Markup Language)

HTML은 웹 페이지의 **구조**를 담당합니다.

```html
<!DOCTYPE html>
<html>
<head>
    <title>페이지 제목</title>
</head>
<body>
    <h1>제목</h1>
    <p>내용</p>
</body>
</html>
```

**주요 태그들:**
- `<h1>` ~ `<h6>`: 제목
- `<p>`: 단락
- `<div>`: 블록 컨테이너
- `<a>`: 링크
- `<img>`: 이미지

### 2. CSS (Cascading Style Sheets)

CSS는 웹 페이지의 **스타일**을 담당합니다.

```css
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
}

h1 {
  color: #333;
  font-size: 28px;
}
```

**주요 속성들:**
- `color`: 텍스트 색상
- `background-color`: 배경 색상
- `font-size`: 글자 크기
- `padding`: 내부 여백
- `margin`: 외부 여백

### 3. JavaScript

JavaScript는 웹 페이지의 **상호작용**을 담당합니다.

```javascript
function greet(name) {
  alert(`안녕하세요, ${name}님!`);
}

function badSleep(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
    //  ㅋㅋ
    }
}
```


##  팁

- 공식 문서를 자주 참고
- 실제 프로젝트를 만들면서 배우기
- 개발자 도구를 활용
- 커뮤니티와 소통


