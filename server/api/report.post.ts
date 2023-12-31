import { Octokit } from 'octokit'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_TOKEN}`,
  })

  octokit.rest.issues.create({
    owner: 'listennn08',
    repo: 'tech-fresh-salary',
    title: 'Bug report',
    body: `Someone reported a bug, please check it out.

\`\`\`
${body.errors.join('\n')}
\`\`\`

[url](event.node.req.headers.origin)})
`,
  })

  return {
    status: 200,
    body: 'Successfully created an issue.',
  }
})