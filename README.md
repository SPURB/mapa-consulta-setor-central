# Operação Urbana Centro
Mapa interativo da consulta pública do Projeto de Intervenção Urbana Centro. 

## Pré-requisito para desenvolvimento
* [nodejs e npm](https://nodejs.org/).
* [http-server](https://github.com/indexzero/http-server). 

### Intruções

1. Instale as dependências do projeto.
    ```
    npm install
    ```

2. Crie os dados da aplicação a partir da [planilha](https://docs.google.com/spreadsheets/d/11W0_h0AcOxGvziGuZTolvEmdOS9VfNxP4WT-Sm_x80M/edit?usp=sharing
):
    ```
    npm run files
    ```

3. Você precisará de duas janelas do terminal para desenvolver. Inicie o http-server com cors em `http://locahost:8080` para servir os arquivos kmls. Com o http-server instalado globalmente `http-server i -g` inicie o host dos kmls no terminal.
    ```
    http-server --cors
    ```

4. Em uma nova janela do terminal inicie a aplicação para desenvolvimento em `http://locahost:1234`.
    ```
    npm run start
    ```
Abra esta [url](http://localhost:1234/) no browser.



## Configure as suas variáveis de ambiente

A partir do arquivo `.env` crie dois arquivos `.env.development.local` e `.env.production.local`. As variáveis seão trocadas de acordo com a tabela abaixo:

| Comandos             | Variáveis                   |
| -------------------- |:----------------------------|
| `npm run start`      | `.env.development.local`    |
| `npm run build`      | `.env.production.local`     |
| `npm run files`      | não utiliza variáveis `.env`|

> Arquivos no padrão `env.*.local` são ingnorados pelo git. Cuidado para **não comitar**  estas variáveis em outros arquivos. Não comitar deleção ou alterações no arquivo `.env`.

### Compile os arquivos para publicação
Crie um arquivo `.env.production.local` com os mesmos parâmetros do arquivo `.env` e com valores do seu ambiente da publicação. 
```
BING_API_KEY=chave-da-api-do-bing-mapas
APP_URL=http://seu.host.http/
API_TOKEN=token-das-consulta-publicas
```

Compile os arquivos no diretório `dist/` com o comando.
``` 
npm run build
```

Publique os arquivos criados em `dist/` para endereço especificado em `.env.production.local`. 

___

Nota interna: Arquivos kmls na rede interna da São Paulo Urbanismo

`\\spurbsp01\Gestao_Projetos\Projetos\OUC_Centro_RevisaoLei12349_97\01_Projeto_Urbanistico\91_Entregas\PIU_Setor_Central_Consulta_2019_03\KML`