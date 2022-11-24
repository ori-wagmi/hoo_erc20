const { expect } = require("chai")
const { ethers, waffle } = require("hardhat")
const keccak256 = require("keccak256");

describe("Test pcAMBR", function () {
  let deployer, user1, user2;
  let AmbrFactory, Ambr;
  const name = "Placeholder Convertible Ambrosia";
  const symbol = "pcAMBR";
  const MINTER_ROLE = keccak256("MinterRole");
  const BURNER_ROLE = keccak256("BurnerRole");
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"

  before(async function() {
    [deployer, user1, user2] = await ethers.getSigners();
    AmbrFactory = await ethers.getContractFactory("PlaceholderConvertibleAmbrosia");
  });

  beforeEach(async function() {
    Ambr = await AmbrFactory.deploy(name, symbol);
  });

  it("Verify contract", async function () {
    expect(await Ambr.name()).to.equal(name);
    expect(await Ambr.symbol()).to.equal(symbol);
    expect(await Ambr.totalSupply()).to.equal(0);
    console.log("Ambr Token name: " + name);
    console.log("Ambr Token symbol: " + symbol);
  })

  it("Verify default roles", async function () {
    // verify deployer roles
    expect(await Ambr.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
    expect(await Ambr.hasRole(MINTER_ROLE, deployer.address)).to.be.false;
    expect(await Ambr.hasRole(BURNER_ROLE, deployer.address)).to.be.false;
    await expect(Ambr.connect(deployer).mint(deployer.address, 100)).to.be.reverted;

    // verify user1 roles
    expect(await Ambr.hasRole(DEFAULT_ADMIN_ROLE, user1.address)).to.be.false;
    expect(await Ambr.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    expect(await Ambr.hasRole(BURNER_ROLE, user1.address)).to.be.false;
    await expect(Ambr.connect(user1).mint(deployer.address, 100)).to.be.reverted;
    await expect(Ambr.connect(user1).adminGrantRole(user1.address, MINTER_ROLE, true)).to.be.reverted;
  });

  it("Verify Mint", async function () {
    // mint tokens
    await Ambr.adminGrantRole(user1.address, MINTER_ROLE, true);
    await Ambr.connect(user1).mint(user1.address, 100);
    expect(await Ambr.balanceOf(user1.address)).to.equal(100);

    // mint tokens for someone else
    await Ambr.connect(user1).mint(user2.address, 100);
    expect(await Ambr.balanceOf(user2.address)).to.equal(100);
  })

  it("Verify Burn", async function () {
    // burn tokens for self
    await Ambr.adminGrantRole(user1.address, MINTER_ROLE, true);
    await Ambr.adminGrantRole(user1.address, BURNER_ROLE, true);
    await Ambr.connect(user1).mint(user1.address, 100);
    expect(await Ambr.balanceOf(user1.address)).to.equal(100);
    await Ambr.connect(user1).burn(user1.address, 100);
    expect(await Ambr.balanceOf(user1.address)).to.equal(0);

    // burn tokens for someone else
    await Ambr.adminGrantRole(user2.address, BURNER_ROLE, true);
    await Ambr.connect(user1).mint(user1.address, 100);
    expect(await Ambr.balanceOf(user1.address)).to.equal(100);
    await Ambr.connect(user2).burn(user1.address, 100);
    expect(await Ambr.balanceOf(user1.address)).to.equal(0);
  });

  it("Verify Revoke Roles", async function () {
    await Ambr.adminGrantRole(user1.address, MINTER_ROLE, true);
    await Ambr.adminGrantRole(user1.address, BURNER_ROLE, true);
    await Ambr.connect(user1).mint(user1.address, 100);

    await Ambr.adminGrantRole(user1.address, MINTER_ROLE, false);
    await expect(Ambr.connect(user1).mint(user1.address, 100)).to.be.reverted;

    await Ambr.connect(user1).burn(user1.address, 50);
    await Ambr.adminGrantRole(user1.address, BURNER_ROLE, false);
    await expect(Ambr.connect(user1).burn(user1.address, 50)).to.be.reverted;
  })

});
