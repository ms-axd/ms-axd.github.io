---
layout: post
title: "Git 명령어 정리"
date: 2026-04-14
category: "개발"
tags: ["Git", "GitHub", "명령어"]
excerpt: "LearnGitBranching에서 다루는 주요 Git 명령어를 실제 작업 흐름 중심으로 정리했다."
---

Git은 작업 기록을 커밋으로 남기고, 브랜치로 흐름을 나누고, 원격 저장소로 작업을 공유하는 도구다. 명령어가 많아 보여도 실제로는 `저장`, `이동`, `합치기`, `되돌리기`, `공유` 흐름으로 묶어서 이해하면 쉽다.

## 기본 작업

Git의 가장 기본 단위는 커밋이다. 커밋은 프로젝트의 특정 시점을 저장한 스냅샷이고, 각 커밋은 고유한 해시값을 가진다. 커밋들이 이전 커밋을 가리키며 연결되기 때문에 Git 히스토리가 만들어진다.

```bash
git commit      # 현재 변경 내용을 새 커밋으로 저장한다. 커밋은 프로젝트의 특정 시점을 기록하는 단위다.
                # 실제 작업에서는 보통 변경사항을 먼저 스테이징한 뒤 커밋한다.

git branch bugFix       # bugFix 라는 새 브랜치를 만든다. 브랜치는 특정 커밋을 가리키는 포인터다.

git checkout bugFix     # bugFix 브랜치로 이동한다.

git checkout -b bugFix      # 브랜치를 만들고 바로 이동한다.
```



## 브랜치 합치기

브랜치에서 나누어 작업한 내용은 다시 합쳐야 한다. Git에서는 주로 `merge`와 `rebase`를 사용한다.

```bash
git merge bugFix        # 현재 브랜치에 bugFix 브랜치의 작업을 합친다. 서로 다른 작업 흐름을 하나로 합칠 때 사용.

git rebase main     # 현재 브랜치의 커밋을 main 브랜치 위로 다시 쌓는다. 커밋 기록을 직선 형태로 정리할 때 유용.
```


## 커밋 이동

`HEAD`는 현재 내가 보고 있는 위치를 가리키는 포인터다. 보통 `HEAD`는 브랜치를 가리키고, 브랜치는 다시 특정 커밋을 가리킨다.

```bash
git checkout HEAD^      # 현재 커밋의 부모 커밋으로 이동.

git checkout HEAD~3     #현재 위치에서 세 단계 이전 커밋으로 이동.

git checkout main^      # main 브랜치가 가리키는 커밋의 부모로 이동.

git branch -f main HEAD~3       # main 브랜치 포인터를 현재 위치 기준 세 단계 이전 커밋으로 강제로 옮긴다.
```




## 변경 되돌리기

변경을 되돌리는 명령은 상황에 따라 다르게 사용해야 한다. 아직 공유하지 않은 커밋은 `reset`으로 정리할 수 있고, 이미 공유한 커밋은 `revert`로 되돌리는 것이 안전하다.

```bash
git reset HEAD~1        # 현재 브랜치를 한 커밋 이전으로 되돌린다. 로컬에서 아직 공유하지 않은 커밋을 정리할 때 주로 사용한다.

git revert HEAD     # 현재 커밋의 변경을 취소하는 새 커밋을 만든다. 이미 원격에 올렸거나 다른 사람과 공유한 커밋을 되돌릴 때 사용한다.
```

`--soft`는 커밋만 취소하고 스테이징 상태를 유지한다. 

`--hard`는 커밋과 변경사항을 모두 지우므로 조심해서 사용해야 한다.


## 원격 저장소

원격 저장소는 GitHub 같은 서버에 있는 저장소다. 로컬에서 만든 커밋을 원격에 올리거나, 원격의 변경사항을 로컬로 가져올 때 사용한다.

```bash
git clone <url>     # 원격 저장소를 로컬로 복제

git fetch       # 원격 저장소의 새 커밋을 가져온다. 이 명령은 로컬 브랜치나 작업 파일을 직접 바꾸지 않는다.

git pull        # 원격 변경을 가져오고 현재 브랜치에 합친다. 기본적으로 git fetch 다음 git merge를 실행하는 것과 비슷하다.

git pull --rebase       # 원격 변경을 가져온 뒤 내 커밋을 그 위에 다시 쌓는다.

git push        # 내 로컬 커밋을 원격 저장소에 업로드.

```

`origin/main`은 원격 `main` 브랜치의 로컬 복사본이다. 원격 저장소가 바뀌어도 자동으로 갱신되지 않기 때문에 `git fetch`를 해야 최신 상태가 된다.

## 원격 브랜치 다루기

```bash
git checkout -b side origin/main        # origin/main을 기준으로 side 브랜치를 만들고 추적 관계를 설정.

git branch -u origin/main side      # side 브랜치가 origin/main을 추적하도록 설정.

git push origin main        # 로컬 main 브랜치를 원격 origin의 main 브랜치로 올린다.

git push origin main:newBranch      # 로컬 main의 커밋을 원격 newBranch 브랜치로 올린다. 원격 브랜치가 없으면 새로 만들어진다.

git push origin :oldBranch      # 원격의 oldBranch 브랜치를 삭제.
```

처음 push할 때 `-u` 옵션을 붙이면 현재 브랜치가 원격 브랜치를 추적하도록 설정된다. 이후에는 `git push`, `git pull`만 입력해도 연결된 원격 브랜치를 기준으로 동작한다.

```bash
git push -u origin main
```

## 특정 커밋 옮기기

전체 브랜치를 합치지 않고 필요한 커밋만 가져오고 싶을 때는 `cherry-pick`을 사용한다. 커밋 히스토리를 정리하거나 마지막 커밋을 수정할 때는 `rebase -i`, `commit --amend`를 사용한다.

```bash
git cherry-pick C2      # C2 커밋의 변경만 현재 위치에 복사.

git cherry-pick C2 C4       # 여러 커밋을 순서대로 현재 브랜치에 복사.

git rebase -i HEAD~4        # 최근 네 개 커밋을 대화형으로 정리한다. 커밋 순서를 바꾸거나 특정 커밋을 제외할 수 있다.

git commit --amend      # 마지막 커밋을 수정한다. 커밋 메시지를 고치거나 빠뜨린 변경을 마지막 커밋에 포함할 때 사용한다.
```


## 태그

태그는 특정 커밋에 버전 이름을 붙일 때 사용한다. 보통 배포 버전처럼 나중에 다시 찾아야 하는 지점에 붙인다.

```bash
git tag v1 C1       # `C1` 커밋에 `v1` 태그를 붙인다.

git describe main       #`main` 위치를 가장 가까운 태그 기준으로 설명한다.
```



## 자주 쓰는 흐름



```bash
git fetch       #원격 변경만 먼저 확인하고 싶을 때

git pull        #원격 변경을 가져와 현재 브랜치에 합칠 때

git pull --rebase       #원격 변경 위에 내 작업을 깔끔하게 다시 쌓을 때

git pull --rebase
git push                #원격과 충돌 없이 최신 상태로 맞춘 뒤 올릴 때

git cherry-pick <commit>        #특정 커밋 하나만 가져오고 싶을 때

git reset HEAD~1        #공유하지 않은 마지막 커밋을 취소할 때

git revert HEAD         #이미 공유한 커밋을 안전하게 되돌릴 때
```

## git 배우기 미션

![Git 1](/assets/images/git1.png)

![Git 2](/assets/images/git2.png)
