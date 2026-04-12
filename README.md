# Ms_AxD Blog

Jekyll 기반 개인 블로그
## 기술 스택

- Jekyll `~> 4.3.0`
- Minima `~> 2.5`
- kramdown
- jekyll-seo-tag
- jekyll-sitemap
- jekyll-paginate
- jekyll-feed
- jemoji

## 프로젝트 구조

```text
.
├── _config.yml              # 사이트 설정, 내비게이션, 카테고리 목록
├── _layouts/
│   ├── default.html         # 공통 레이아웃, 사이드바, 검색, 터미널 로드
│   └── post.html            # 포스트 상세 레이아웃, 태그, 댓글
├── _posts/                  # 블로그 포스트
├── assets/
│   ├── css/style.css        # 전체 스타일
│   ├── images/              # 프로필, favicon, 로고 이미지
│   └── js/
│       ├── blog-sort.js         # 블로그 목록 최신순/오래된순 정렬
│       ├── category-tabs.js     # 카테고리 탭 전환
│       ├── cursor-glow.js       # 마우스 커서 glow 효과
│       ├── discord-popover.js   # Discord 아이디 팝오버
│       ├── mini-terminal.js     # 미니 터미널 모달
│       ├── search.js            # search-data.json 기반 검색
│       ├── sidebar-calendar.js  # 오른쪽 사이드 캘린더
│       └── tag-filter.js        # 태그 필터
├── index.html               # 홈, 최근 글
├── blog.html                # 전체 글 목록
├── categories.html          # 카테고리별 글 목록
├── tags.html                # 태그별 필터
├── archives.html            # 연도별 아카이브
├── about.html               # 소개 페이지
├── search-data.json         # 클라이언트 검색 데이터
├── 404.html                 # 404 페이지
├── Gemfile                  # Ruby/Jekyll 의존성
└── README.md
```


## 로컬 실행

Ruby와 Bundler가 필요.

```bash
bundle install
bundle exec jekyll serve
```

## 포스트 작성

포스트는 `_posts` 폴더에 `YYYY-MM-DD-title.md` 형식으로 추가.

```markdown
---
layout: post
title: 포스트 제목
date: 2026-04-13
category: CTF/Wargame
tags: [web, ctf]
excerpt: 목록에 표시될 짧은 설명
---

본문 내용
```

`category` 값은 `_config.yml`의 `category_list`와 일치해야 카테고리 페이지에서 정상적으로 묶인다.

## 검색 데이터

검색은 `assets/js/search.js`가 `/search-data.json`을 불러와 클라이언트에서 처리. 포스트를 추가하거나 제목/본문/태그가 바뀌면 `search-data.json`도 함께 갱신해야 검색 결과에 반영됨.

## 주요 설정

`_config.yml`에서 관리하는 값:

- `title`, `description`, `author`, `email`
- `url`, `baseurl`, `repository`
- `paginate`, `paginate_path`
- `nav_links`
- `category_list`
- 포스트 기본 permalink: `/blog/:year/:month/:day/:slug/`

## 배포

GitHub Pages 저장소로 push하면 Jekyll 빌드 후 배포되는 구성을 기준으로 한다.

```bash
git add .
git commit -m "Update blog"
git push origin main
```

## 참고

- Jekyll: https://jekyllrb.com/
- GitHub Pages: https://pages.github.com/
- Utterances: https://utteranc.es/
