# 🎉 GitHub 블로그 설정 완료!

완벽한 기능의 Jekyll 블로그가 생성되었습니다. 아래 단계를 따라 배포하세요.

## 📋 필수 설정

### 1단계: `_config.yml` 수정

`_config.yml` 파일을 열어 다음을 수정하세요:

```yaml
title: 내 블로그 제목           # ← 변경
description: 블로그 설명        # ← 변경
author: 본인 이름              # ← 변경
email: your-email@example.com  # ← 변경
url: "https://yourusername.github.io"  # ← yourname 변경
repository: "yourusername/yourusername.github.io"  # ← 변경
```

### 2단계: 댓글 기능 설정

`_layouts/post.html`을 열어 다음 부분을 수정:

```html
<script src="https://utteranc.es/client.js"
    repo="yourusername/yourusername.github.io"  <!-- ← 여기 변경 -->
    issue-term="pathname"
    theme="github-light"
    crossorigin="anonymous"
    async>
</script>
```

### 3단계: GitHub 저장소 생성

1. [GitHub](https://github.com/new)에서 새 저장소 생성
2. 저장소 이름: **`yourusername.github.io`** (정확히!)
3. Public 선택
4. Initialize 없이 생성

### 4단계: 로컬 저장소 푸시

```bash
# 초기화
git init
git add .
git commit -m "Initial commit: Jekyll blog"
git branch -M main

# 원격 저장소 추가 (yourusername 변경!)
git remote add origin https://github.com/ms-axd/ms-axd.github.io.git

# 푸시
git push -u origin main
```

### 5단계: 배포 확인

1. GitHub 저장소의 **Settings** → **Pages** 확인
2. Branch가 `main`으로 설정되어 있어야 함
3. `https://yourusername.github.io` 에서 블로그 확인 (5분 소요)

## ✨ 주요 기능

### ✅ 완성된 기능들

- 🎨 **라이트/다크 모드**: 자동 및 수동 토글
- 🔍 **검색 기능**: 제목, 내용, 태그 검색
- 💬 **댓글**: Utterances 통합
- 📂 **6개 카테고리**: 개발, CTF/Wargame, BugBounty, 일상, 기술서, 도움/컨퍼런스, 공모전/자격
- 🏷️ **태그 시스템**: 유연한 분류
- 📱 **반응형 디자인**: 모바일 최적화
- 📋 **샘플 포스트**: 6개의 예제

## 📝 첫 포스트 작성

`_posts` 폴더에 새 파일 생성:

```markdown
---
layout: post
title: 포스트 제목
date: 2024-04-06
category: 개발
tags: [태그1, 태그2]
excerpt: 간단한 설명
---

포스트 내용을 여기에 작성하세요.
```

**파일명 규칙**: `YYYY-MM-DD-slugified-title.md`

## 🎨 커스터마이징

### 색상 변경

`assets/css/style.scss`의 `:root` 부분:

```scss
:root {
  --primary-color: #6366f1;      /* 주요 색상 */
  --secondary-color: #ec4899;    /* 보조 색상 */
}
```

### 네비게이션 변경

`_config.yml`의 `nav_links` 부분:

```yaml
nav_links:
  - title: 메뉴명
    url: /path/
```

## 📂 파일 구조

```
blog/
├── _posts/              # 포스트 (자동 정렬)
├── _layouts/
│   ├── default.html     # 기본 레이아웃
│   └── post.html        # 포스트 레이아웃
├── assets/
│   ├── css/style.scss   # 스타일
│   └── js/              # JavaScript
├── index.html           # 홈페이지
├── blog.html            # 블로그 목록
├── categories.html      # 카테고리
├── about.html           # 소개
├── _config.yml          # 설정
└── Gemfile              # 의존성
```

## 🔧 로컬에서 테스트

```bash
# 의존성 설치
bundle install

# 로컬 서버 실행
bundle exec jekyll serve

# http://localhost:4000 에서 확인
```

## 🚀 첫 포스트 배포

1. 포스트 작성 후 저장
2. 터미널에서:
   ```bash
   git add .
   git commit -m "Add first post"
   git push origin main
   ```
3. 5분 후 블로그에서 확인!

## 💡 팁

- ✅ Markdown 문법은 [여기](https://www.markdownguide.org/) 참고
- ✅ 포스트는 자동으로 역순 정렬됨
- ✅ 드래프트는 `_drafts` 폴더에 저장
- ✅ 검색은 공개 포스트만 색인됨
- ✅ 댓글은 GitHub 계정으로만 가능

## ❓ 문제 해결

### 블로그가 보이지 않으면
- GitHub Pages 설정 확인
- 저장소 이름 다시 확인 (`yourusername.github.io`)
- 15분 정도 더 기다림

### CSS가 적용되지 않으면
- `_config.yml`의 `baseurl` 확인 (보통 비워둔다)
- 브라우저 캐시 삭제

### 댓글이 안 되면
- Utterances 저장소 이름 확인
- 저장소가 Public인지 확인
- Utterances 앱이 설치되었는지 확인

---

**축하합니다! 🎉 당신의 블로그가 준비되었습니다!**

더 자세한 정보는 [Jekyll 공식 문서](https://jekyllrb.com/)를 참고하세요.

**행운을 빕니다!** 💪
