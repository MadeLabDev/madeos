import { ElementTransformer } from "@lexical/markdown";

import { $createTweetNode, $isTweetNode, TweetNode } from "@/components/editor/nodes/embeds/tweet-node";

export const TWEET: ElementTransformer = {
	dependencies: [TweetNode],
	export: (node) => {
		if (!$isTweetNode(node)) {
			return null;
		}

		return `<tweet id="${node.getId()}" />`;
	},
	regExp: /<tweet id="([^"]+?)"\s?\/>\s?$/,
	replace: (textNode, _1, match) => {
		// Ensure we have a captured id (string) before calling $createTweetNode
		const id = Array.isArray(match) ? match[1] : undefined;
		if (!id) {
			return;
		}

		const tweetNode = $createTweetNode(id);
		textNode.replace(tweetNode);
	},
	type: "element",
};
