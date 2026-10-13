---
layout: project
title: /skills
permalink: /skills
date: 2026-09-26
tags:
  - design
description: Agentic skills to help me do things
---
A repository of agentic skills to help me write, design, and create better.

```shell
npx skills add andreeeeaaaaas/skills
```

## [/portfolio](https://github.com/andreeeeaaaaas/skills/tree/main/skills/portfolio)

**Record contributions, decisions, and key context over time across personal and work projects.**

![[assets/projects/skills-portfolio.webp]]

Creating portfolio pieces after a project should be the easy part. The hard work is already done; the thinking has happened; the assets have been created.

`/portfolio` perches on your shoulder as you work and updates three key files:
1. context.md
2. decisions.md
3. timeline.md

The first file is key context that the agent grabs about the project: challenge, problem, solution, process, and outcomes. The next two record the changes made over the course of development. It's easier to read these two files than 20 commits or an endless scroll in an agent chat.

Alongside these is a JSON file that stores the data.

I've used `/portfolio` across a number of personal and work projects. Often all that's required to get a case study out there is a review of `context.md` and a quick edit.

It's what I did for this writeup.

## [/tmpmd](https://github.com/andreeeeaaaaas/skills/tree/main/skills/tmpmd)

**Read your agent's last answer somewhere nicer than the terminal.**

![[assets/projects/skills-tmpmd.webp]]

It can be hard to read long verbose output in the terminal. This is true when using any agent that operates within a command line interface (CLI): Claude Code, Codex, Gemini, etc. 

Calling the skill creates a temporary file with the most recent output (after tool calls) as a `.md` file. The skill can be set to continuous to continually overwrite that file with the last output.

After a session ends the file is deleted. It also opens the file in your default markdown app. For most Mac users this is TextEdit, however you can [set a new default very easily](https://support.apple.com/en-sg/guide/mac-help/mh35597/mac).

This skill works best when paired with applications that update on content change. I use `/tmpmd` with [Obsidian](https://obsidian.md/) to increase legibility of long streams of content, and quickly scan to find more relevant information.

