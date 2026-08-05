# Writing

Two kinds of articles share the `/blog` feed:

- **Site posts:** `content/blog/<slug>.mdx`, served at `/blog/<slug>`.
- **Repo articles:** files listed in a repo `blog/index.txt`, served at
  `/blog/<project-slug>/content/<slug>`.

The latest article from each project also appears in the home "In the pipeline"
carousel. Repo article files use frontmatter (`title`, `date`, `summary`,
`tags`) then a Markdown body.
