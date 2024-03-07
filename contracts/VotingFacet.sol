// SPDX-License-Identifier: MIT
pragma solidity =0.8.24;

import { Survey, WithStorage } from "./WithStorage.sol";
import { IERC20 } from "@solidstate/contracts/interfaces/IERC20.sol";

struct SurveyCreate {
    IERC20 token;
    string name;
    string description;
    uint votingStart;
    uint votingDeadline;
}

struct SurveyData {
    IERC20 token;
    string name;
    string description;
    uint votingStart;
    uint votingDeadline;
    uint numberOfVotes;
    uint yesVotes;
    uint noVotes;
    address creator;
}

contract VotingFacet is WithStorage {
    event SurveyCreated(IERC20 indexed token, address indexed creator, uint surveyId);
    event AllowedCreatorAdded(address creator);
    event VoteCast(address indexed voter, uint indexed surveyId, bool support);

    function createSurvey(SurveyCreate memory survey_) external {
        require(voting().allowedToCreateSurvey[msg.sender], "VotingFacet: signer not allowed to create survey");
        require(a().allowedTokens[address(survey_.token)], "VotingFacet: token not allowed");
        require(survey_.votingStart < survey_.votingDeadline, "VotingFacet: voting start is after voting deadline");
        require(bytes(survey_.name).length > 0, "VotingFacet: name cannot be empty");
        require(survey_.votingDeadline > block.timestamp, "VotingFacet: voting deadline is in the past");
        require(survey_.token.balanceOf(msg.sender) > 0, "VotingFacet: survey creator must have token balance to create survey");

        uint surveyId = voting().surveyIds.length;
        voting().surveyIds.push(surveyId);
        Survey storage survey = voting().surveys[surveyId];
        survey.name = survey_.name;
        survey.description = survey_.description;
        survey.token = survey_.token;
        survey.votingStart = survey_.votingStart;
        survey.votingDeadline = survey_.votingDeadline;
        survey.creator = msg.sender;

        emit SurveyCreated(survey_.token, msg.sender, surveyId);
    }

    function vote(uint256 surveyId, bool support) external {
        Survey storage survey = voting().surveys[surveyId];

        require(bytes(survey.name).length > 0, "VotingFacet: survey does not exist");
        require(survey.votingStart < block.timestamp, "VotingFacet: voting has not started");
        require(survey.votingDeadline > block.timestamp, "VotingFacet: voting has ended");
        require(survey.voted[msg.sender] == false, "VotingFacet: already voted");
        require(staking().balances[address(survey.token)][msg.sender] > 0, "VotingFacet: must have staked token balance to vote");
        require(staking().lastTimeStaked[address(survey.token)][msg.sender] <= survey.votingStart, "VotingFacet: must have staked before voting start to vote");

        survey.voted[msg.sender] = true;
        survey.numberOfVotes += 1;
        if (support) {
            survey.yesVotes += 1;
        } else {
            survey.noVotes += 1;
        }

        emit VoteCast(msg.sender, surveyId, support);
    }

    function addToAllowedCreators(address creator) external {
        require(ds().contractOwner == msg.sender, "VotingFacet: must be contract owner");

        voting().allowedToCreateSurvey[creator] = true;

        emit AllowedCreatorAdded(creator);
    }

    function getSurvey(uint256 surveyId) external view returns (SurveyData memory surveyData) {
        Survey storage survey = voting().surveys[surveyId];

        surveyData = SurveyData({
            token: survey.token,
            name: survey.name,
            description: survey.description,
            votingStart: survey.votingStart,
            votingDeadline: survey.votingDeadline,
            numberOfVotes: survey.numberOfVotes,
            yesVotes: survey.yesVotes,
            noVotes: survey.noVotes,
            creator: survey.creator
        });
    }
}
