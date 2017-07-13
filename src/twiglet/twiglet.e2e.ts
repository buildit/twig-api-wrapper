/* tslint:disable:no-unused-expression */
import { expect } from "chai";
import { pick } from "ramda";
import { login } from "../";
import config from "../config";
import { Model } from "../model";
import { cookieJar } from "../rpOptions";
import { ILatestCommit, ILink, INode } from "./../interfaces";
import { ITwigletCreation, ITwigletListResponse, ITwigletResponse, ITwigletUpdate, Twiglet } from "./twiglet";

function newTwiglet(): ITwigletCreation {
  return {
    commitMessage: "Initial Commit",
    description: "Testing the API wrapper",
    model: "WRAPPER TEST MODEL",
    name: "WRAPPER TEST",
  };
}

function twigletDetails(commitMessage = ""): ITwigletUpdate {
  return {
    commitMessage,
    description: "A NEW DESCRIPTION",
    links: [
      {
        id: "1-2",
        source: "1",
        target: "2",
      },
    ],
    name: "A NEW NAME",
    nodes: [
      {
        id: "1",
        name: "one",
        type: "ent1",
      },
      {
        id: "2",
        name: "two",
        type: "ent2",
      },
    ],
  };
}

describe("Twiglets", () => {
  let model: Model;
  before(async () => {
    config.useLocal();
    await login("ben.hernandez@corp.riglet.io", "Z3nB@rnH3n");
    model = await Model.create({
      commitMessage: "initial commit",
      entities: {
        ent1: {
          attributes: [],
          class: "class1",
          image: "A",
          type: "ent1",
        },
        ent2: {
          attributes: [],
          class: "class2",
          image: "B",
          type: "ent2",
        },
      },
      name: "WRAPPER TEST MODEL",
    });
  });

  after(async () => {
    await model.remove();
  });

  describe("create", () => {
    let twiglet: Twiglet;
    let twigletCount: number;

    before(async () => {
      twigletCount = (await Twiglet.getList()).length;
      twiglet = await Twiglet.create(newTwiglet());
    });

    after(async () => {
      await twiglet.remove();
    });

    it("names the twiglet correctly", () => {
      expect(twiglet.name).to.equal(newTwiglet().name);
    });

    it("increases the number of twilgets in the list", async () => {
      const currentCount = (await Twiglet.getList()).length;
      expect(currentCount).to.equal(twigletCount + 1);
    });
  });

  describe("getList", () => {
    let list: ITwigletListResponse[];
    let twiglet: Twiglet;
    before(async () => {
      twiglet = await Twiglet.create(newTwiglet());
      list = await Twiglet.getList();
    });

    after(async () => {
      await twiglet.remove();
    });

    it("gets a list of the twiglets", () => {
      expect(list.length).to.be.at.least(1);
    });

    it("has a name key in the list entries", () => {
      expect(list[0].name).not.to.be.undefined;
    });

    it("has a description key in the list entries", () => {
      expect(list[0].description).not.to.be.undefined;
    });

    it("has a url key in the list entries", () => {
      expect(list[0].url).not.to.be.undefined;
    });
  });

  describe("instance", () => {
    let twiglet: Twiglet;
    before(async () => {
      await Twiglet.create(newTwiglet());
      const list = await Twiglet.getList();
      const entry = list.filter((e) => e.name === newTwiglet().name)[0];
      const noNodesOrLinks = await Twiglet.instance(entry.url);
      await noNodesOrLinks.update(pick(["commitMessage", "links", "nodes"], twigletDetails("adding nodes and links")));
      twiglet = await Twiglet.instance(entry.url);
    });

    after(async () => {
      await twiglet.remove();
    });

    it("returns the description", () => {
      expect(twiglet.description).to.equal(newTwiglet().description);
    });

    it("returns the links", () => {
      expect(twiglet.links).to.deep.equal(twigletDetails().links);
    });

    it("returns the name", () => {
      expect(twiglet.name).to.equal(newTwiglet().name);
    });

    it("returns the nodes", () => {
      expect(twiglet.nodes).to.deep.equal(twigletDetails().nodes);
    });

    it("returns the latest commit", () => {
      const unchangingVariables = ["message", "user"];
      expect(pick(unchangingVariables, twiglet.latestCommit)).to.deep.equal({
        message: "adding nodes and links",
        user: "ben.hernandez@corp.riglet.io",
      });
    });
  });

  describe("update", () => {
    let twiglet: Twiglet;

    describe("description updates", () => {
      const newCommitMessage = "Changing the name";

      before(async () => {
        await Twiglet.create(newTwiglet());
        const list = await Twiglet.getList();
        const entry = list.filter((e) => e.name === newTwiglet().name)[0];
        twiglet = await Twiglet.instance(entry.url);
        await twiglet.update(pick(["description", "commitMessage"], twigletDetails(newCommitMessage)));
      });

      after(async () => {
        await twiglet.remove();
      });

      it("updates the description", () => {
        expect(twiglet.description).to.deep.equal(twigletDetails().description);
      });

      it("does not change the links", () => {
        expect(twiglet.links).to.deep.equal([]);
      });

      it("does not change the name", () => {
        expect(twiglet.name).to.equal(newTwiglet().name);
      });

      it("does not change the nodes", () => {
        expect(twiglet.nodes).to.deep.equal([]);
      });

      it("updates the latest commit", () => {
        expect(twiglet.latestCommit.message).to.equal(newCommitMessage);
      });
    });

    describe("links updates", () => {
      const newCommitMessage = "Changing the links";

      before(async () => {
        await Twiglet.create(newTwiglet());
        const list = await Twiglet.getList();
        const entry = list.filter((e) => e.name === newTwiglet().name)[0];
        twiglet = await Twiglet.instance(entry.url);
        await twiglet.update(pick(["links", "commitMessage"], twigletDetails(newCommitMessage)));
      });

      after(async () => {
        await twiglet.remove();
      });

      it("does not change the description", () => {
        expect(twiglet.description).to.deep.equal(newTwiglet().description);
      });

      it("updates the links", () => {
        expect(twiglet.links).to.deep.equal(twigletDetails().links);
      });

      it("does not change the name", () => {
        expect(twiglet.name).to.equal(newTwiglet().name);
      });

      it("does not change the nodes", () => {
        expect(twiglet.nodes).to.deep.equal([]);
      });

      it("updates the latest commit", () => {
        expect(twiglet.latestCommit.message).to.equal(newCommitMessage);
      });
    });

    describe("name updates", () => {
      const newCommitMessage = "Changing the name";

      before(async () => {
        await Twiglet.create(newTwiglet());
        const list = await Twiglet.getList();
        const entry = list.filter((e) => e.name === newTwiglet().name)[0];
        twiglet = await Twiglet.instance(entry.url);
        await twiglet.update(pick(["name", "commitMessage"], twigletDetails(newCommitMessage)));
      });

      after(async () => {
        await twiglet.remove();
      });

      it("does not change the description", () => {
        expect(twiglet.description).to.deep.equal(newTwiglet().description);
      });

      it("does not change the links", () => {
        expect(twiglet.links).to.deep.equal([]);
      });

      it("updates the name", () => {
        expect(twiglet.name).to.equal(twigletDetails().name);
      });

      it("does not change the nodes", () => {
        expect(twiglet.nodes).to.deep.equal([]);
      });

      it("updates the latest commit", () => {
        expect(twiglet.latestCommit.message).to.equal(newCommitMessage);
      });
    });

    describe("nodes updates", () => {
      const newCommitMessage = "Changing the nodes";

      before(async () => {
        await Twiglet.create(newTwiglet());
        const list = await Twiglet.getList();
        const entry = list.filter((e) => e.name === newTwiglet().name)[0];
        twiglet = await Twiglet.instance(entry.url);
        await twiglet.update(pick(["nodes", "commitMessage"], twigletDetails(newCommitMessage)));
      });

      after(async () => {
        await twiglet.remove();
      });

      it("does not change the description", () => {
        expect(twiglet.description).to.deep.equal(newTwiglet().description);
      });

      it("does not change the links", () => {
        expect(twiglet.links).to.deep.equal([]);
      });

      it("does not change the name", () => {
        expect(twiglet.name).to.equal(newTwiglet().name);
      });

      it("updates the nodes", () => {
        expect(twiglet.nodes).to.deep.equal(twigletDetails().nodes);
      });

      it("updates the latest commit", () => {
        expect(twiglet.latestCommit.message).to.equal(newCommitMessage);
      });
    });

    describe("multiple updates", () => {
      const newCommitMessage = "Changing everything";

      before(async () => {
        await Twiglet.create(newTwiglet());
        const list = await Twiglet.getList();
        const entry = list.filter((e) => e.name === newTwiglet().name)[0];
        twiglet = await Twiglet.instance(entry.url);
        await twiglet.update(twigletDetails(newCommitMessage));
      });

      after(async () => {
        await twiglet.remove();
      });

      it("updates the description", () => {
        expect(twiglet.description).to.deep.equal(twigletDetails().description);
      });

      it("updates the links", () => {
        expect(twiglet.links).to.deep.equal(twigletDetails().links);
      });

      it("updates the name", () => {
        expect(twiglet.name).to.equal(twigletDetails().name);
      });

      it("updates the nodes", () => {
        expect(twiglet.nodes).to.deep.equal(twigletDetails().nodes);
      });

      it("updates the latest commit", () => {
        expect(twiglet.latestCommit.message).to.equal(newCommitMessage);
      });
    });
  });

  describe("remove", () => {
    let list: ITwigletListResponse[];
    let newList: ITwigletListResponse[];
    let twiglet: Twiglet;
    before(async () => {
      await Twiglet.create(newTwiglet());
      list = await Twiglet.getList();
      const entry = list.filter((e) => e.name === newTwiglet().name)[0];
      twiglet = await Twiglet.instance(entry.url);
      await twiglet.remove();
      newList = await Twiglet.getList();
    });

    it("the list of twiglets decreases by 1", async () => {
      expect(newList.length).to.equal(list.length - 1);
    });

    it("removes the twiglet from the list of twiglets", () => {
      expect(newList.every((entry) => entry.name !== newTwiglet().name));
    });

    it("clears out the description", () => {
      expect(twiglet.description).to.be.null;
    });

    it("clears out the links", () => {
      expect(twiglet.links).to.be.null;
    });

    it("clears the name out of the twiglet", () => {
      expect(twiglet.name).to.be.null;
    });

    it("clears the nodes out of the twiglet", () => {
      expect(twiglet.nodes).to.be.null;
    });

    it("clears out the latestCommit", () => {
      expect(twiglet.latestCommit).to.be.null;
    });
  });

  describe("changelog", () => {
    let twiglet: Twiglet;
    before(async () => {
      await Twiglet.create(newTwiglet());
      const list = await Twiglet.getList();
      const entry = list.filter((e) => e.name === newTwiglet().name)[0];
      twiglet = await Twiglet.instance(entry.url);
    });

    after(async () => {
      await twiglet.remove();
    });

    it("can get the initial changelog", async () => {
      const changelog = await twiglet.changelog.getLogs();
      expect(changelog[0].message).to.equal(newTwiglet().commitMessage);
    });

    it("can get the updated changelog", async () => {
      await twiglet.update(pick(["name", "commitMessage"], twigletDetails("new name")));
      const changelog = await twiglet.changelog.getLogs();
      expect(changelog[0].message).to.equal("new name");
    });
  });
});
