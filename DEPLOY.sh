#!/bin/bash

# GitHub Pages 배포 가이드

echo "=== GitHub 블로그 배포 가이드 ==="

# 1단계
echo ""
echo "1단계: GitHub저장소 생성"
echo "- GitHub에서 새 저장소 생성"
echo "- 저장소 이름: yourusername.github.io"
echo "- 공개(Public) 선택"

# 2단계
echo ""
echo "2단계: 로컬 저장소 설정"
read -p "GitHub 사용자명을 입력하세요: " username

git init
git add .
git commit -m "Initial commit: Jekyll blog setup"
git branch -M main
git remote add origin https://github.com/${username}/${username}.github.io.git
git push -u origin main

# 3단계
echo ""
echo "3단계: _config.yml 업데이트"
echo "다음 항목들을 수정하세요:"
echo "- title: 블로그 제목"
echo "- description: 블로그 설명"
echo "- author: 작성자명"
echo "- email: 이메일 주소"
echo "- url: https://${username}.github.io"
echo "- repository: ${username}/${username}.github.io"

# 4단계
echo ""
echo "4단계: 댓글 기능 설정"
echo "- _layouts/post.html에서 'yourusername' 부분을 자신의 GitHub 사용자명으로 변경"
echo "- Utterances (https://utteranc.es/)에서 설정 완료"

# 5단계
echo ""
echo "5단계: 배포 확인"
echo "- 브라우저에서 https://${username}.github.io 접속"
echo "- 마지막 배포까지 5분 정도 소요될 수 있습니다"

echo ""
echo "=== 배포 완료! ==="
