# Mapa da consulta PIU Setor Central
Mapa interativo da consulta pública do Projeto de Intervenção Urbana Centro. 

## Pré-requisitos para desenvolvimento. 
São necessárias as seguintes instalações globais para iniciar o desenvolvimento:
* [git-fls](https://git-lfs.github.com/)
* [nodejs e npm](https://nodejs.org/)
* [http-server](https://github.com/indexzero/http-server)

### Intruções

1. Instale as dependências do projeto.
```
npm install
```

2. Compile os dados da aplicação disponibilizados na [planilha do google docs](https://docs.google.com/spreadsheets/d/11W0_h0AcOxGvziGuZTolvEmdOS9VfNxP4WT-Sm_x80M/edit?usp=sharing
):
```
npm run files
```

3. Você precisará de duas janelas do terminal para desenvolver. Inicie o http-server com cors em `http://locahost:8080` para servir os arquivos kmls. Com o http-server instalado globalmente - `http-server i -g` - inicie o host dos kmls no terminal.
```
# instale http-server globalmente
npm i -g http-server

# inicie http-server com CORS liberado
http-server --cors
```

4. Em uma nova janela do terminal inicie a aplicação para desenvolvimento em `http://locahost:1234`.
```
npm run start
```
Abra [localhost:1234](http://localhost:1234/) no seu browser.


## Configure as suas variáveis de ambiente

A partir do arquivo `.env` crie dois arquivos `.env.development.local` e `.env.production.local`. As variáveis seão trocadas de acordo com a tabela abaixo:

| Comandos             | Variáveis                   |
| -------------------- |:----------------------------|
| `npm run start`      | `.env.development.local`    |
| `npm run build`      | `.env.production.local`     |
| `npm run files`      | não utiliza variáveis `.env`|

As variáveis a serem configiraddas nos arquivo `*.env` são: 
```
BING_API_KEY=chave-da-api-do-bing-mapas
APP_URL=http://seu.host.http/
API_TOKEN=token-das-consulta-publicas
```

> Arquivos no padrão `env.*.local` são ingnorados pelo git. Cuidado para **não comitar**  estas variáveis em outros arquivos. Não comitar deleção ou alterações no arquivo `.env`.

### Compile os arquivos para publicação
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

## 
> ### Nota
Arquivos kmls na rede interna da São Paulo Urbanismo estão disponíveis em:
`\\spurbsp01\Gestao_Projetos\Projetos\OUC_Centro_RevisaoLei12349_97\01_Projeto_Urbanistico\91_Entregas\PIU_Setor_Central_Consulta_2019_03\KML`

