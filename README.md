# MY FIRST BLOG !

## 
Jekyll을 기반으로 한 개인 블로그입니다. GitHub Pages를 통해 호스팅됩니다.


##  프로젝트 구조

```
.
├── _posts/              # 블로그 포스트
├── _layouts/            # 레이아웃 템플릿
├── _includes/           # 공통 컴포넌트
├── assets/
│   ├── css/            # 스타일시트
│   └── js/             # JavaScript 파일
├── index.html          # 홈페이지
├── blog.html           # 블로그 페이지
├── categories.html     # 카테고리 페이지
├── about.html          # 소개 페이지
├── _config.yml         # Jekyll 설정
└── Gemfile             # 루비 의존성
```


### 요구사항
- Ruby 2.7 이상
- Jekyll 4.3.0 이상

```
##  포스트 작성

`_posts` 폴더에 아래 형식으로 파일을 생성:

```markdown
---
layout: post
title: 포스트 제목
date: 2024-04-05
category: 개발
tags: [태그1, 태그2]
excerpt: 간단한 설명
---

포스트 내용...
```

### 사용 가능한 카테고리

1. **개발** - 프로그래밍 및 웹 개발
2. **CTF/Wargame** - 사이버보안 및 CTF
3. **BugBounty** - 버그 바운티 및 보안 연구
4. **일상** - 개발자의 일상 이야기
5. **블로그/기술문서** - 기술 서적 리뷰 및 학습
6. **논문/컨퍼런스** - 도움이 되는 정보
7. **자격증/공모전** - 자격증


## 🔍 검색 기능

검색 기능은 `/search-data.json`을 기반으로 작동합니다.



```bash
git add .
git commit -m "블로그 포스트 추가"
git push origin main
```

## 📄 라이선스

MIT License - 자유롭게 사용 가능합니다.


## 🔗 참고 자료

- [Jekyll 공식 문서](https://jekyllrb.com/)
- [GitHub Pages](https://pages.github.com/)
- [Utterances](https://utteranc.es/)

---
