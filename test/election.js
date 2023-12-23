var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
  var electionInstance;

  it("initializes with two candidates", async function() {
    electionInstance = await Election.deployed();
    const count = await electionInstance.candidatesCount();
    assert.equal(count, 2);
  });

  it("allows a voter to cast a vote", async function() {
    electionInstance = await Election.deployed();
    const candidateId = 1;
    await electionInstance.vote(candidateId, { from: accounts[0] });
    const voted = await electionInstance.voters(accounts[0]);
    assert(voted, "the voter was marked as voted");
    const candidate = await electionInstance.candidates(candidateId);
    const voteCount = candidate[2];
    assert.equal(voteCount, 1, "increments the candidate's vote count");
  });

  it("throws an exception for invalid candidates", async function() {
    electionInstance = await Election.deployed();
    const candidateId = 99;
    try {
      await electionInstance.vote(candidateId, { from: accounts[1] });
      assert.fail("Expected an exception");
    } catch (error) {
      assert(error.message.indexOf("revert") >= 0, "error message must contain revert");
      const candidate1 = await electionInstance.candidates(1);
      const voteCount1 = candidate1[2];
      assert.equal(voteCount1, 1, "candidate 1 did not receive any votes");
      const candidate2 = await electionInstance.candidates(2);
      const voteCount2 = candidate2[2];
      assert.equal(voteCount2, 0, "candidate 2 did not receive any votes");
    }
  });

  it("throws an exception for double voting", async function() {
    electionInstance = await Election.deployed();
    const candidateId = 2;
    await electionInstance.vote(candidateId, { from: accounts[1] });
    const candidate = await electionInstance.candidates(candidateId);
    const voteCount = candidate[2];
    assert.equal(voteCount, 1, "accepts first vote");

    // Try to vote again
    try {
      await electionInstance.vote(candidateId, { from: accounts[1] });
      assert.fail("Expected an exception");
    } catch (error) {
      assert(error.message.indexOf("revert") >= 0, "error message must contain revert");
      const candidate1 = await electionInstance.candidates(1);
      const voteCount1 = candidate1[2];
      assert.equal(voteCount1, 1, "candidate 1 did not receive any votes");
      const candidate2 = await electionInstance.candidates(2);
      const voteCount2 = candidate2[2];
      assert.equal(voteCount2, 1, "candidate 2 did not receive any votes");
    }
  });

  it("it initializes the candidates with the correct values", async function () {
    electionInstance = await Election.deployed();
    const candidate1 = await electionInstance.candidates(1);
    assert.equal(candidate1[0], 1, "contains the correct id");
    assert.equal(candidate1[1], "Candidate 1", "contains the correct name");
    assert.equal(candidate1[2], 1, "contains the correct votes count"); // Update to 1

    const candidate2 = await electionInstance.candidates(2);
    assert.equal(candidate2[0], 2, "contains the correct id");
    assert.equal(candidate2[1], "Candidate 2", "contains the correct name");
    assert.equal(candidate2[2], 1, "contains the correct votes count"); // Update to 1
  });
});
