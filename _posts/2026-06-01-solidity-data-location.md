---
layout: post
title: "Solidity Study"
date: 2026-06-01
category: "블로그/기술문서"
tags: ["Solidity", "Ethereum", "Smart Contract", "EVM"]
excerpt: "Solidity 정리"
---

Solidity는 Ethereum 계열 체인에서 스마트 컨트랙트를 작성하는 언어다.

Solidity는 아래 네 가지를 같이 이해해야 한다.

```text
문법
EVM 실행 방식
가스 비용
보안 패턴
```

스마트 컨트랙트는 배포하면 수정이 어렵다.

그래서 `돌아가는 코드`보다 `상태를 안전하게 바꾸는 코드`가 중요하다고 한다.

---

## Solidity 기본

기본 컨트랙트는 이렇게 생겼다.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;

    event Increased(address indexed user, uint256 newCount);

    function increase() external {
        count += 1;
        emit Increased(msg.sender, count);
    }
}
```

구성은

```text
SPDX License
-> 라이선스 표시

pragma
-> 컴파일러 버전 지정

contract
-> 상태 변수와 함수 묶음

event
-> 체인 로그 기록

function
-> 상태 조회 또는 변경 로직
```

`pragma solidity ^0.8.24;`는 `0.8.24` 이상, `0.9.0` 미만 컴파일러를 허용한다는 뜻이다.

---

### EVM 관점

Solidity 코드는 EVM bytecode로 컴파일된다.

EVM은 Ethereum Virtual Machine이다.

컨트랙트 함수가 호출되면 EVM이 bytecode를 실행하고, 그 결과로 상태가 바뀐다.

```text
Solidity 코드
-> 컴파일
-> bytecode
-> 배포
-> EVM 실행
-> storage 변경
```

중요한 점은 세 가지다.

```text
상태 변경은 트랜잭션이다.
트랜잭션은 가스를 쓴다.
실패한 트랜잭션도 실행한 만큼 가스를 쓴다.
```

조회만 하는 함수는 보통 `view`, `pure`로 작성한다.

---

## 타입과 데이터

값 타입은 데이터 자체가 복사된다.

대표 타입은 아래와 같다.

```solidity
bool isOpen;

uint256 amount;
int256 signedAmount;

address owner;
address payable receiver;

bytes32 hash;
```

`uint`는 `uint256`의 별칭이다.

실전에서는 `uint256`처럼 정확히 써 주는 편이 읽기 좋다.

`address payable`은 ETH를 받을 수 있는 주소 타입이다.

```solidity
address user = msg.sender;
address payable receiver = payable(msg.sender);
```

---

### 위치를 신경 써야 하는 타입

아래 타입은 데이터가 커질 수 있다.

그래서 데이터 위치를 같이 생각해야 한다.

```solidity
string name;
bytes data;
uint256[] numbers;

struct User {
    string name;
    uint256 score;
}

mapping(address => uint256) balances;
```

자주 쓰는 타입은 네 가지다.

```text
string
-> UTF-8 문자열

bytes
-> 길이가 변할 수 있는 바이트 배열

array
-> 같은 타입의 값 묶음

struct
-> 여러 필드를 가진 사용자 정의 타입
```

`mapping`은 key-value 저장소다.

Solidity에서 `mapping`은 길이 순회가 안 된다.

키 목록이 필요하면 별도 배열을 같이 관리해야 한다.

---

### 상태 변수

상태 변수는 블록체인에 저장되는 값이다.

```solidity
contract Vault {
    address public owner;
    uint256 public totalDeposit;
    mapping(address => uint256) public balances;
}
```

상태 변수는 `storage`에 저장된다.

상태를 바꾸면 트랜잭션이 필요하고 가스를 쓴다.

```text
상태 변수 읽기
-> 상대적으로 저렴

상태 변수 쓰기
-> 비쌈

새 storage 슬롯 사용
-> 더 비쌈
```

필요 없는 값은 상태에 저장하지 않는 것이 좋다.

계산으로 얻을 수 있는 값은 계산하는 편이 나을 때가 많다.

---

## 함수

함수는 입력값을 받고 코드를 실행한 뒤 값을 돌려줄 수 있다.

```solidity
function add(uint256 a, uint256 b) external pure returns (uint256) {
    return a + b;
}
```

`returns`는 돌려줄 값의 타입을 적는다.

돌려줄 값에 이름을 붙일 수도 있다.

```solidity
function add(uint256 a, uint256 b) external pure returns (uint256 result) {
    result = a + b;
}
```

이 경우 마지막에 `return result;`를 생략할 수 있다.

하지만 `return`을 직접 써 주는 편이 읽기 쉬운 경우가 많다.

---

### 함수 접근 범위

함수와 변수에는 접근 범위가 있다.

```text
public
-> 내부와 외부에서 호출 가능

external
-> 외부 호출용

internal
-> 현재 컨트랙트와 상속 컨트랙트에서만 접근 가능

private
-> 현재 컨트랙트에서만 접근 가능
```

예시는 아래와 같다.

```solidity
contract Visibility {
    uint256 public a;
    uint256 internal b;
    uint256 private c;

    function externalFunction() external {}
    function publicFunction() public {}
    function internalFunction() internal {}
    function privateFunction() private {}
}
```

외부에서 호출할 함수는 보통 `external`을 우선 고려한다.

컨트랙트 내부에서도 호출해야 하면 `public`을 쓴다.

---

### 상태 변경 여부

함수는 상태를 읽거나 바꾸는 방식에 따라 표시할 수 있다.

```text
view
-> 상태를 읽지만 바꾸지 않음

pure
-> 상태를 읽지도 바꾸지도 않음

payable
-> ETH를 받을 수 있음
```

```solidity
contract FunctionType {
    uint256 public count;

    function getCount() external view returns (uint256) {
        return count;
    }

    function add(uint256 a, uint256 b) external pure returns (uint256) {
        return a + b;
    }

    function deposit() external payable {
        count += msg.value;
    }
}
```

`msg.value`는 호출자가 보낸 ETH 양이다.

단위는 wei다.

---

## ETH와 실행 정보

Solidity는 ETH 단위를 지원한다.

```solidity
uint256 oneWei = 1 wei;
uint256 oneGwei = 1 gwei;
uint256 oneEther = 1 ether;
```

관계는 아래와 같다.

```text
1 ether = 1,000,000,000,000,000,000 wei
1 gwei  = 1,000,000,000 wei
```

스마트 컨트랙트 내부 계산은 정수로 처리한다.

소수는 직접 쓰지 않는다.

---

### 기본 제공 값

Solidity에는 트랜잭션과 블록 정보를 담은 기본 제공 값이 있다.

```solidity
msg.sender
msg.value
msg.data

block.timestamp
block.number
block.chainid

tx.origin
```

자주 쓰는 값은 아래와 같다.

```text
msg.sender
-> 현재 함수를 직접 호출한 주소

msg.value
-> 함께 보낸 ETH 양

block.timestamp
-> 현재 블록 시간

block.number
-> 현재 블록 번호

block.chainid
-> 현재 체인 ID
```

`tx.origin`은 인증에 사용하면 안 된다.

중간 컨트랙트를 거친 호출에서 피싱 취약점이 생길 수 있다.

권한 검사는 거의 항상 `msg.sender`를 기준으로 한다.

---

### require, revert, assert

조건 확인은 스마트 컨트랙트에서 매우 중요하다.

```solidity
function withdraw(uint256 amount) external {
    require(amount > 0, "amount is zero");
}
```

세 가지를 구분해야 한다.

```text
require
-> 사용자 입력, 권한, 상태 조건 확인

revert
-> 직접 실패 처리

assert
-> 절대 깨지면 안 되는 내부 규칙 확인
```

커스텀 에러를 쓰면 가스를 줄일 수 있다.

```solidity
error NotOwner();

contract Ownable {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function onlyOwnerJob() external {
        if (msg.sender != owner) {
            revert NotOwner();
        }
    }
}
```

문자열 에러보다 커스텀 에러가 일반적으로 더 효율적이다.

---

### constructor

`constructor`는 배포 시 한 번 실행된다.

```solidity
contract Ownable {
    address public owner;

    constructor(address initialOwner) {
        owner = initialOwner;
    }
}
```

초기 관리자, 초기 설정값, 토큰 이름 등을 세팅할 때 쓴다.

배포 후에는 다시 실행되지 않는다.

---

### modifier

`modifier`는 함수 실행 전후에 공통 조건을 붙일 때 사용한다.

```solidity
contract OnlyOwner {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function adminJob() external onlyOwner {
        // 관리자만 실행
    }
}
```

`_;` 위치에 원래 함수 본문이 들어간다.

권한 검사, 일시정지 검사, 재진입 방어 등에 자주 사용한다.

---

### event

`event`는 로그를 남긴다.

상태 변수처럼 컨트랙트 안에서 바로 순회하는 데이터가 아니다.

프론트엔드, 인덱서, 분석 도구가 읽기 좋은 기록이다.

```solidity
contract EventExample {
    event Deposited(address indexed user, uint256 amount);

    function deposit() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}
```

`indexed`를 붙이면 로그 검색이 쉬워진다.

보통 주소, ID처럼 필터링할 값에 붙인다.

---

## storage, memory, calldata

Solidity에서 배열, 문자열, 구조체 같은 타입을 다룰 때는 데이터 위치를 확실히 알아야 한다.

```text
storage
-> 블록체인 상태에 저장

memory
-> 함수 실행 중 임시 저장

calldata
-> 외부에서 들어온 값을 읽기 전용으로 사용
```

데이터 위치를 잘못 고르면 가스가 낭비되거나, 의도와 다른 상태 변경이 발생한다.

---

### storage

`storage`는 컨트랙트의 영구 저장소다.

상태 변수는 기본적으로 `storage`에 저장된다.

```solidity
contract StorageExample {
    struct User {
        string name;
        uint256 score;
    }

    User public user;

    function setUser(string calldata name, uint256 score) external {
        user = User(name, score);
    }
}
```

`user`는 상태 변수다.

트랜잭션이 끝나도 값이 남는다.

그래서 `storage` 쓰기는 비싸다.

---

### storage로 원본 다루기

`storage` 변수는 원본 상태를 직접 가리킬 수 있다.

```solidity
contract StorageReference {
    struct User {
        string name;
        uint256 score;
    }

    mapping(address => User) public users;

    function addScore(uint256 amount) external {
        User storage user = users[msg.sender];
        user.score += amount;
    }
}
```

`User storage user = users[msg.sender];`는 복사본이 아니다.

원본 상태를 직접 다룬다.

따라서 `user.score += amount;`는 실제 상태를 변경한다.

---

### memory

`memory`는 함수 실행 중에만 존재하는 임시 공간이다.

```solidity
contract MemoryExample {
    function makeNumbers() external pure returns (uint256[] memory) {
        uint256[] memory numbers = new uint256[](3);

        numbers[0] = 1;
        numbers[1] = 2;
        numbers[2] = 3;

        return numbers;
    }
}
```

`memory`에 값을 바꿔도 컨트랙트 상태는 바뀌지 않는다.

---

### calldata

`calldata`는 외부 함수 호출의 입력 데이터 위치다.

읽기 전용이고, 복사 비용이 낮다.

```solidity
contract CalldataExample {
    function sum(uint256[] calldata numbers) external pure returns (uint256 total) {
        for (uint256 i = 0; i < numbers.length; i++) {
            total += numbers[i];
        }
    }
}
```

외부 함수에서 배열, 문자열, 구조체를 읽기만 한다면 보통 `calldata`가 적절하다.

---

### 선택 기준

데이터 위치는 아래 기준으로 고른다.

```text
상태 변수에 저장해야 한다
-> storage

상태 변수를 직접 수정해야 한다
-> storage reference

함수 안에서 임시 데이터를 만들어야 한다
-> memory

외부 함수 입력값을 읽기만 한다
-> calldata
```

암기하면 된다.

```text
영구 저장이면 storage
임시 작업이면 memory
외부 입력 읽기 전용이면 calldata
```

---

## 자료구조

배열은 길이가 고정된 배열과 길이가 변하는 배열이 있다.

```solidity
uint256[3] fixedArray;
uint256[] dynamicArray;
```

길이가 변하는 배열은 `push`, `pop`, `length`를 쓴다.

```solidity
contract ArrayExample {
    uint256[] public numbers;

    function add(uint256 number) external {
        numbers.push(number);
    }

    function removeLast() external {
        numbers.pop();
    }

    function size() external view returns (uint256) {
        return numbers.length;
    }
}
```

중간 원소 삭제는 조심해야 한다.

`delete numbers[index]`는 길이를 줄이지 않고 값을 기본값으로 만든다.

```solidity
delete numbers[1];
```

순서가 중요하지 않으면 마지막 값과 바꾸고 `pop`하는 방식이 싸다.

```solidity
function remove(uint256 index) external {
    numbers[index] = numbers[numbers.length - 1];
    numbers.pop();
}
```

---

### mapping

`mapping`은 key-value 저장소다.

```solidity
contract BalanceBook {
    mapping(address => uint256) public balances;

    function setBalance(address user, uint256 amount) external {
        balances[user] = amount;
    }
}
```

존재하지 않는 키를 읽으면 기본값이 나온다.

```text
uint256 -> 0
bool    -> false
address -> address(0)
```

`mapping`은 순회할 수 없다.

필요하면 키 배열을 따로 둔다.

---

### struct

`struct`는 관련 값을 묶는다.

```solidity
contract UserStore {
    struct User {
        string name;
        uint256 score;
        bool exists;
    }

    mapping(address => User) public users;

    function register(string calldata name) external {
        require(!users[msg.sender].exists, "already registered");

        users[msg.sender] = User({
            name: name,
            score: 0,
            exists: true
        });
    }
}
```

`exists` 필드는 등록 여부를 구분할 때 자주 사용한다.

기본값만으로 존재 여부를 판단하면 애매한 경우가 생긴다.

---

### enum

`enum`은 정해진 상태 중 하나를 표현한다.

```solidity
contract OrderBook {
    enum Status {
        Created,
        Paid,
        Shipped,
        Cancelled
    }

    Status public status;

    function pay() external {
        require(status == Status.Created, "invalid status");
        status = Status.Paid;
    }
}
```

상태 머신을 만들 때 좋다.

숫자보다 의미가 확실하다.

---

## ETH 송수신과 외부 호출

ETH를 직접 받을 때는 `receive`나 `fallback`을 사용한다.

```solidity
contract Receiver {
    event Received(address sender, uint256 amount);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }
}
```

차이는 아래와 같다.

```text
receive
-> calldata가 비어 있고 ETH를 받을 때 실행

fallback
-> 호출한 함수가 없거나 calldata가 있을 때 실행
```

둘 다 `payable`이 아니면 ETH를 받을 수 없다.

---

### ETH 보내기

ETH 전송은 보통 `call`을 사용한다.

```solidity
function sendEth(address payable to, uint256 amount) external {
    (bool success, ) = to.call{value: amount}("");
    require(success, "send failed");
}
```

`transfer`, `send`는 과거에 많이 쓰였지만 현재는 가스 제한 문제 때문에 `call`이 더 일반적이다.

단, `call`은 외부 컨트랙트 코드를 실행할 수 있다.

그래서 재진입 공격을 반드시 고려해야 한다.

---

### 외부 컨트랙트 호출

인터페이스를 만들어 두면 다른 컨트랙트를 호출할 수 있다.

```solidity
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TokenSender {
    function sendToken(address token, address to, uint256 amount) external {
        bool success = IERC20(token).transfer(to, amount);
        require(success, "transfer failed");
    }
}
```

외부 호출은 실패할 수 있다.

외부 호출 이후에 상태를 바꾸면 위험해질 수 있다.

---

## 재사용 구조

Solidity는 상속을 지원한다.

```solidity
contract Ownable {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }
}

contract AdminVault is Ownable {
    function adminJob() external onlyOwner {
        // 관리자 로직
    }
}
```

공통 권한 로직, 토큰 표준 구현, 보안 모듈을 재사용할 때 쓴다.

실전에서는 OpenZeppelin 라이브러리를 많이 사용한다.

---

### interface

`interface`는 외부 컨트랙트의 함수 모양만 적어 둔 것이다.

```solidity
interface IVault {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}
```

구현은 없고 함수 선언만 있다.

다른 컨트랙트를 타입 안전하게 호출할 수 있다.

---

### library

`library`는 재사용 함수 묶음이다.

```solidity
library MathLib {
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }
}

contract UseLibrary {
    function bigger(uint256 a, uint256 b) external pure returns (uint256) {
        return MathLib.max(a, b);
    }
}
```

같은 계산 로직을 여러 컨트랙트에서 재사용할 때 쓴다.

---

### modifier 남용 주의

`modifier`는 편하지만 과하게 쓰면 흐름이 숨는다.

```solidity
modifier validAmount(uint256 amount) {
    require(amount > 0, "zero amount");
    _;
}
```

간단한 권한 검사에는 좋다.

복잡한 상태 변경 코드는 modifier보다 함수 본문에 확실히 보이게 쓰는 편이 낫다.

---

### ABI

ABI는 Application Binary Interface다.

외부에서 컨트랙트를 호출하기 위한 함수 약속이다.

```text
함수 이름
입력 타입
출력 타입
이벤트 정보
```

프론트엔드는 ABI를 보고 컨트랙트 함수를 호출한다.

Solidity 코드는 사람이 읽는 코드고, ABI는 외부 프로그램이 호출하기 위한 설명서에 가깝다.

---

## Gas와 보안

가스는 EVM 실행 비용이다.

가스를 많이 쓰는 작업은 보통 아래와 같다.

```text
storage 쓰기
배열 전체 순회
큰 데이터 복사
외부 컨트랙트 호출
컨트랙트 배포
```

가스 절약 기준은 단순하다.

```text
불필요한 storage 쓰기 줄이기
큰 배열을 한 번에 순회하지 않기
calldata를 쓸 수 있으면 calldata 사용
반복해서 읽는 storage 값은 memory 변수에 캐싱
```

예시는 아래와 같다.

```solidity
function sum(uint256[] calldata numbers) external pure returns (uint256 total) {
    uint256 length = numbers.length;

    for (uint256 i = 0; i < length; i++) {
        total += numbers[i];
    }
}
```

작은 차이보다 구조가 더 중요하다.

가장 큰 비용은 대부분 storage와 반복문에서 나온다.

---

### 보안 기본 원칙

Solidity 보안은 아래 문장으로 시작하면 된다.

```text
외부 입력은 믿지 않는다.
외부 컨트랙트 호출은 믿지 않는다.
상태 변경 순서를 신경 쓴다.
권한 검사를 빼먹지 않는다.
```

스마트 컨트랙트는 공격자가 직접 호출한다.

프론트엔드에서 버튼을 숨겨도 의미 없다.

컨트랙트 안에서 직접 확인해야 한다.

---

### Checks Effects Interactions

외부 호출이 있는 함수는 순서가 중요하다.

```text
Checks
-> 조건 검사

Effects
-> 내부 상태 변경

Interactions
-> 외부 호출
```

나쁜 예시는 아래와 같다.

```solidity
function withdrawBad(uint256 amount) external {
    require(balances[msg.sender] >= amount, "not enough");

    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "send failed");

    balances[msg.sender] -= amount;
}
```

외부 호출 후에 잔액을 줄인다.

이러면 재진입 공격에 취약하다.

좋은 예시는 아래와 같다.

```solidity
function withdrawGood(uint256 amount) external {
    require(balances[msg.sender] >= amount, "not enough");

    balances[msg.sender] -= amount;

    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "send failed");
}
```

상태를 먼저 바꾸고 외부 호출을 한다.

---

### Reentrancy

재진입 공격은 외부 호출 중 다시 내 컨트랙트로 들어오는 공격이다.

방어 방법은 세 가지다.

```text
Checks Effects Interactions 적용
ReentrancyGuard 사용
pull payment 구조 사용
```

간단한 락 예시는 아래와 같다.

```solidity
contract ReentrancyLock {
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "reentrant");
        locked = true;
        _;
        locked = false;
    }
}
```

실전에서는 OpenZeppelin `ReentrancyGuard`를 쓰는 편이 안전하다.

---

### Access Control

권한 검사는 기본 중 기본이다.

```solidity
contract AccessControlExample {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        owner = newOwner;
    }
}
```

주의할 점은 아래와 같다.

```text
관리자 함수에 onlyOwner 누락 금지
address(0) 확인
소유권 이전 절차 확인
tx.origin으로 인증 금지
```

---

### Integer

Solidity `0.8.0`부터는 기본적으로 overflow, underflow를 검사한다.

```solidity
function underflow() external pure returns (uint256) {
    uint256 x = 0;
    return x - 1; // revert
}
```

검사를 끄고 싶으면 `unchecked`를 쓴다.

```solidity
function addUnchecked(uint256 x) external pure returns (uint256) {
    unchecked {
        return x + 1;
    }
}
```

`unchecked`는 정말 안전한 범위가 증명될 때만 사용해야 한다.

---

### Delegatecall

`delegatecall`은 호출 대상의 코드를 내 컨트랙트 storage 기준으로 실행한다.

프록시 패턴에서 사용된다.

하지만 매우 위험하다.

```text
delegatecall 대상 코드가 내 상태를 바꿀 수 있음
storage layout이 맞지 않으면 상태가 깨짐
악성 로직이면 컨트랙트 탈취 가능
```

입문 단계에서는 직접 구현하지 않는 편이 좋다.

프록시가 필요하면 많이 쓰이고 확인된 OpenZeppelin 업그레이드 패턴을 먼저 보는 것이 낫다.

---

### Randomness

온체인에서 안전한 랜덤은 어렵다.

아래 값은 랜덤으로 쓰면 안 된다.

```solidity
block.timestamp
block.number
blockhash(block.number - 1)
```

블록을 만드는 사람이나 공격자가 어느 정도 예측하거나 조작할 수 있다.

게임, 추첨, NFT 민팅 랜덤에는 VRF 같은 외부에서 확인 가능한 랜덤을 사용해야 한다.

---

### Timestamp

`block.timestamp`는 시간 조건에 자주 사용한다.

```solidity
require(block.timestamp >= unlockTime, "locked");
```

큰 단위의 시간 잠금에는 괜찮다.

하지만 초 단위 정밀도가 필요한 로직이나 랜덤에는 적합하지 않다.

---

## 공부 체크

Solidity 공부는 테스트와 같이 해야 빨리 는다.

테스트할 항목은 아래처럼 잡으면 된다.

```text
정상 경로
권한 없는 호출
0 값 입력
address(0) 입력
잔액 부족
중복 호출
경계값
외부 호출 실패
이벤트 발생
```

컨트랙트는 배포 후 수정이 어렵다.

테스트는 선택이 아니라 기본이다.

---

### 읽는 순서

Solidity를 처음 공부하면 아래 순서가 좋다.

```text
1. contract 구조
2. 변수와 타입
3. 함수, visibility, view, pure, payable
4. storage, memory, calldata
5. mapping, array, struct
6. event, error, modifier
7. ETH 송수신
8. 외부 컨트랙트 호출
9. ERC-20, ERC-721
10. reentrancy, access control, delegatecall
```

---

### 암기표

외워야 할것

```text
msg.sender
-> 현재 직접 호출자

msg.value
-> 보낸 ETH 양

storage
-> 영구 저장

memory
-> 임시 복사

calldata
-> 외부 입력 읽기 전용

external
-> 외부 호출 중심

public
-> 내부와 외부 호출

internal
-> 현재 + 상속 컨트랙트

private
-> 현재 컨트랙트

view
-> 상태 읽기 가능, 변경 불가

pure
-> 상태 읽기 불가, 변경 불가

payable
-> ETH 수신 가능

require
-> 조건 확인

revert
-> 직접 실패 처리

event
-> 로그 기록

modifier
-> 공통 실행 조건

mapping
-> key-value, 순회 불가

delegatecall
-> 상대 코드, 내 storage로 실행
```

---

## 정리

Solidity는 문법보다 실행 모델이 중요하다.

아래 기준으로 계속 생각해야 한다.

```text
이 함수는 상태를 바꾸는가?
누가 호출할 수 있는가?
ETH나 토큰이 이동하는가?
외부 컨트랙트를 호출하는가?
storage를 직접 바꾸는가?
실패하면 어떤 상태가 남는가?
```

스마트 컨트랙트는 돈을 다루는 코드다.

그래서 항상 권한, 상태 변경 순서, 외부 호출, 가스 비용을 같이 봐야 한다.
