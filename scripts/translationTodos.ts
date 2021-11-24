import gitlog from 'gitlog';

const commits = 
  gitlog({repo: __dirname}).filter(commit => commit.files.length > 0);

console.log(commits);