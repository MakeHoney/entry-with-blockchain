pragma solidity ^0.4.8;

contract Paper {
    uint256 keyIndex;
    struct userInformation {
        string name;
        string phoneNum;
        string addr;
    }

    mapping (uint256 => userInformation) Obj;
    function setInformation(string _name, string _phoneNum, string _addr) constant returns (uint256) {
        Obj[keyIndex].name = _name;
        Obj[keyIndex].phoneNum = _phoneNum;
        Obj[keyIndex].addr = _addr;
        keyIndex++;
        return keyIndex;
    }

    function getName(uint _key) constant returns (string) {
        return Obj[_key].name;
    }

    function getPhoneNum(uint _key) constant returns (string) {
        return Obj[_key].phoneNum;
    }

    function getAddress(uint _key) constant returns (string) {
        return Obj[_key].addr;
    }
}
