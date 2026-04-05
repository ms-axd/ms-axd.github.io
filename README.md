# 나의 블로그 🚀

## 📋 개요

Jekyll을 기반으로 한 개인 블로그입니다. GitHub Pages를 통해 호스팅됩니다.

**주요 기능:**
- ✨ 라이트/다크 모드 지원
- 🔍 포스트 검색 기능
- 💬 댓글 기능 (Utterances)
- 📂 카테고리 분류 (6개)
- 🏷️ 태그 시스템
- 📱 반응형 디자인

## 🏗️ 프로젝트 구조

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

## 🚀 시작하기

### 요구사항
- Ruby 2.7 이상
- Jekyll 4.3.0 이상

### 설치 및 실행

```bash
# 의존성 설치
bundle install

# 로컬 서버 실행
bundle exec jekyll serve

# 웹 브라우저에서 http://localhost:4000 접속
```

## 📝 포스트 작성

`_posts` 폴더에 아래 형식으로 파일을 생성합니다:

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
5. **기술서** - 기술 서적 리뷰 및 학습
6. **도움/컨퍼런스** - 도움이 되는 정보

## ⚙️ 설정

`_config.yml`에서 다음 항목들을 수정하세요:

```yaml
title: 블로그 제목
description: 블로그 설명
author: 작성자
email: your-email@example.com
url: "https://yourusername.github.io"
repository: "yourusername/yourusername.github.io"
```

## 🎨 커스터마이징

### 다크 모드 토글
`assets/js/theme-toggle.js`에서 테마 관련 설정을 변경할 수 있습니다.

### 색상 변경
`assets/css/style.scss`의 `:root` 부분에서 색상을 변경하세요:

```scss
:root {
  --primary-color: #6366f1;      /* 주요 색상 */
  --secondary-color: #ec4899;    /* 보조 색상 */
  /* ... */
}
```

## 🔍 검색 기능

검색 기능은 `/search-data.json`을 기반으로 작동합니다.

## 💬 댓글 설정

Utterances를 사용 중입니다. `_layouts/post.html`에서 저장소를 변경하세요:

```html
<script src="https://utteranc.es/client.js"
    repo="yourusername/yourusername.github.io"
    ...
</script>
```

## 📦 배포

### GitHub Pages를 통한 배포

1. 깃허브 저장소를 `yourusername.github.io`로 생성
2. 모든 파일을 푸시
3. `https://yourusername.github.io`에서 블로그 확인

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

**문제가 발생하거나 피드백이 있으신가요?** 이슈를 등록해주세요! 📧
