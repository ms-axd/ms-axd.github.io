# Ms_AxD Blog

Jekyll 기반 개인 블로그.

## 기술 스택

- Jekyll `~> 4.3.0`
- Minima `~> 2.5`
- kramdown
- jekyll-seo-tag
- jekyll-sitemap
- jekyll-paginate
- jekyll-feed
- jemoji

## 로컬 실행

Ruby와 Bundler가 필요하다.

```bash
bundle install
bundle exec jekyll serve
```

기본 주소는 `http://localhost:4000`이다.

## 포스트 작성

포스트는 `_posts` 폴더에 `YYYY-MM-DD-title.md` 형식으로 추가한다.

```markdown
---
layout: post
title: "포스트 제목"
date: 2026-05-18
category: "블로그/기술문서"
tags: ["EIP", "Ethereum"]
excerpt: "목록에 표시될 짧은 설명"
---

본문 내용
```

`category` 값은 `_config.yml`의 `category_list`와 일치해야 카테고리 페이지에서 정상적으로 묶인다.

현재 카테고리:

- `Bug bounty`
- `CTF/Wargame`
- `개발`
- `자격증/공모전`
- `논문/컨퍼런스`
- `블로그/기술문서`

## 검색 데이터

검색은 `assets/js/search.js`가 `/search-data.json`을 불러와 클라이언트에서 처리한다.

`search-data.json`은 Jekyll Liquid 템플릿으로 `site.posts`를 순회한다. 포스트를 추가하거나 수정하면 빌드 시 검색 데이터에 자동 반영된다.

## 주요 설정

`_config.yml`에서 관리한다.

- `title`, `description`, `author`, `email`
- `url`, `baseurl`, `repository`
- `paginate`, `paginate_path`
- `nav_links`
- `category_list`
- 포스트 기본 permalink: `/blog/:slug/`
- 시간대: `Asia/Seoul`

## 배포

GitHub Pages 저장소로 push하면 Jekyll 빌드 후 배포된다.

```bash
git add .
git commit -m "Update blog"
git push origin main
```

## 참고

- Jekyll: https://jekyllrb.com/
- GitHub Pages: https://pages.github.com/
- Utterances: https://utteranc.es/
