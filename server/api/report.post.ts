import { Octokit } from 'octokit'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_TOKEN}`,
  })

  const errorsString = body.errors?.join('\n') ?? 'User reported a bug but no error was found.'
  await octokit.rest.issues.create({
    owner: 'listennn08',
    repo: 'tech-fresh-salary',
    title: 'Bug report',
    body: `Someone reported a bug, please check it out.

\`\`\`
${errorsString}
\`\`\`

[url](${event.node.req.headers.origin})
`,
  })

  return {
    status: 200,
    body: 'Successfully created an issue.',
  }
})