# Mapa da consulta PIU Setor Central
Mapa interativo da consulta pública do Projeto de Intervenção Urbana Centro. 

## Pré-requisitos para desenvolvimento 
São necessárias as seguintes instalações globais para iniciar o desenvolvimento:
* [git-fls](https://git-lfs.github.com/)
* [nodejs e npm](https://nodejs.org/)
* [http-server](https://github.com/indexzero/http-server)

### Instruções para iniciar ambiente de desenvolvimento

1. Instale as dependências
```
npm install
```

Você precisará de duas janelas do terminal para desenvolver. Antes de tudo instale globalmete o http-server no seu ambiente: `http-server i -g`.

2. Inicie http-server com CORS liberado na raiz deste projeto
```
http-server --cors
```
> Os arquivos kml (`data-src/projetos/*/*.kml`) serão servidos deste host na porta 8080.

3. Em uma nova janela do terminal inicie a aplicação para desenvolvimento em `http://locahost:1234`.
```
npm run start
```
Abra [localhost:1234](http://localhost:1234/) no seu browser. A aplicação deverá estar rodando nesta url. 


## Configure as suas variáveis de ambiente

A partir do arquivo `.env` crie dois arquivos `.env.development.local` e `.env.production.local`. As variáveis seão trocadas de acordo com a tabela abaixo:

| Comandos             | Variáveis                   |
| -------------------- |:----------------------------|
| `npm run start`      | `.env.development.local`    |
| `npm run build`      | `.env.production.local`     |
| `npm run files`      | não utiliza variáveis `.env`|

As variáveis a serem configiraddas nos arquivo `.env` são:
```env
BING_API_KEY=samplekey
APP_URL=http://localhost:8080/
API_TOKEN=sampletoken
API_URL=http://localhost/consulta-publicas-backend/
```
> Se no seu ambiente o `http-server` criar um ambiente em um local diferente de localhost:8080 altere o parâmetro `APP_URL`.

> Arquivos no padrão `env.*.local` são ignorados pelo git. Cuidado para **não comitar**  estas variáveis em outros arquivos. Não comitar deleção ou alterações no arquivo `.env`.


## Atualize os dados da planilha do google sheet
O comando abaixo irá baixar os dados disponibilizados na [planilha do google docs](https://docs.google.com/spreadsheets/d/11W0_h0AcOxGvziGuZTolvEmdOS9VfNxP4WT-Sm_x80M/edit?usp=sharing) em formato json no diretório `data-src/json/`:
```
npm run files
```

### Prepare para publicação
Crie um arquivo `.env.production.local` com os mesmos parâmetros do arquivo `.env` e com valores do seu ambiente da publicação. 

Compile os arquivos no diretório `dist/` com o comando.
``` 
npm run build
```

Publique os arquivos criados em `dist/` para endereço especificado em `.env.production.local`.


## Documentação de bugs
Toda contribuição é bem vinda. Crie uma [issue](https://github.com/SPURB/levantamento-operacao-urbana-centro/issues).

## Licença
[GNU General Public License v3.0](https://github.com/SPURB/levantamento-operacao-urbana-centro/blob/master/LICENSE).
