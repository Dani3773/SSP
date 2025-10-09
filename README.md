SSP — Guia de Colaboração com Git/GitHub

Bem-vindos ao repositório SSP.
Aqui está o guia de como o time deve clonar, criar branches, commitar, abrir Pull Requests (PRs) e manter o fluxo de trabalho organizado.

Primeiro acesso

Clone o repositório e entre na pasta:
git clone https://github.com/Dani3773/SSP.git

cd SSP

Configure seu usuário Git (só precisa uma vez na máquina):
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com
"

Atualize a base antes de começar:
git pull origin main

Fluxo de contribuição (recomendado)

Crie uma branch para sua tarefa:
git checkout -b feat/nome-da-tarefa

Prefixos de branches:
feat/ (nova feature), fix/ (correção), docs/ (documentação), refactor/ (refatoração), chore/ (tarefas gerais).

Faça suas alterações no código.

Adicione e faça commit:
git add .
git commit -m "feat: descrição curta do que foi feito"

Envie sua branch para o GitHub:
git push origin feat/nome-da-tarefa

Abra um Pull Request (PR) no GitHub comparando sua branch com a main.

Após aprovação, faça merge na main.

Apague a branch remota se quiser (opcional, mas recomendado).

Checklist antes de abrir PR

O código compila/roda localmente.

Commits claros e seguindo padrão.

Sem arquivos temporários (use .gitignore).

Testes manuais feitos (explique no PR como testar).

Atualize documentação se necessário.

Sincronizar sua branch com a main

Para atualizar sua branch com a main:
git fetch origin
git checkout main
git pull origin main
git checkout feat/nome-da-tarefa
git merge main

Se preferir rebase:
git rebase main

Se houver conflitos no rebase:
git add .
git rebase --continue

Resolver conflitos

O Git marca conflitos com <<<<<<<, =======, >>>>>>>.

Edite o arquivo e una o conteúdo correto.

Marque como resolvido:
git add .
git commit (se for merge)
git rebase --continue (se for rebase)

Padrão de branches e commits

Exemplos de branches:

feat/login

fix/validacao-email

docs/readme

refactor/servico-x

chore/config-ci

Exemplos de commits (Conventional Commits simplificado):

feat: adiciona módulo de login

fix: corrige validação de e-mail

docs: atualiza instruções

refactor: simplifica cálculo

chore: ajusta .gitignore

Prefira vários commits pequenos a um commit gigante.

Guia rápido de comandos Git

git status → ver status dos arquivos
git add . → adicionar arquivos
git commit -m "msg" → criar commit
git push -u origin branch → enviar branch
git pull origin main → atualizar a main
git checkout -b branch → criar e trocar de branch
git branch -a → listar branches
git checkout main → voltar para main

Problemas comuns

Erro: "src refspec main does not match any"
→ Não há commits na main. Solução:
git add .
git commit -m "first commit"
git push -u origin main

Pediu senha no push (HTTPS)
→ Use seu Token de Acesso Pessoal (PAT) como senha.

Conflitos ao dar pull/merge
→ Resolver conforme seção de conflitos.

Nunca suba senhas ou chaves. Use .env local e crie um arquivo .env.example como modelo.
