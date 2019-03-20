# Projetos da Operação Urbana Centro

## Pré-requisito para desenvolvimento
* [http-server](https://github.com/indexzero/http-server). 

## Intruções para desenvolvimento

1. Instale as dependências
```
npm install
```

2. Renomeie o arquivo e `.env.sample` para `.env` e o altere incluindo a chave do bing maps e o host de publicação:
```
BING_API_KEY=chave-bing-mapas
APP_URL=http://seu-host/levantamento-operacao-urbana-centro
```
> Instruções para gerar uma chave no [bing maps](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key)

3. Inclua os arquivos em `data-src/projetos/id_nome-do-projeto`. Inclua ao menos um arquivo `.kml` em cada diretório criado.

4. Rode o comando:

```
npm run files
```

5. Inicie o http-server com cors liberado
```
http-server --cors
```

6. Inicie a aplicação para desenvolvimento
```
npm run start
```

7. Publique o projeto no diretório `dist/`
``` 
npm run build

```

>Dados originais
```
dados
https://docs.google.com/spreadsheets/d/11W0_h0AcOxGvziGuZTolvEmdOS9VfNxP4WT-Sm_x80M/edit?usp=sharing

kmls
\\spurbsp01\Gestao_Projetos\Projetos\OUC_Centro_RevisaoLei12349_97\01_Projeto_Urbanistico\91_Entregas\PIU_Setor_Central_Consulta_2019_03\KML
```