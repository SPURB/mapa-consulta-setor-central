# Projetos da Operação Urbana Centro

1. Instale as dependências
```
npm install
```

2. Inclua a chave do bing maps e o host de deste repositório no arquivo `.env`:
```
BING_API_KEY=chave-bing-mapas
APP_URL=http://seu-host/levantamento-operacao-urbana-centro
```

4. Altere e renomeie `data-src/Colocalizados.xlsx`.

3. Inclua os arquivos em `data-src/projetos/id_nome-do-projeto`. Inclua ao menos um arquivo `.kml` em cada diretório criado.

5. Rode o comando:

```
npm run files
```

5. Inicie a aplicação para desenvolvimento
```
npm run start
```

6. Publique o projeto no diretório `dist/`
``` 
npm run build
```

7. Observe arquivos em local de deploy
```
npm run watch
```