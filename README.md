# Projetos da Operação Urbana Centro

1. Instale as dependências
```
npm install
```

2. Renomeie o arquivo e `.env.sample` para `.env` e o altere incluindo a chave do bing maps e o host de publicação:
```
BING_API_KEY=chave-bing-mapas
APP_URL=http://seu-host/levantamento-operacao-urbana-centro
```
> É necessário incluir data-src em um server http com cors liberado (ou no mesmo host). Sugestão para facilitar desenvolvimento: [http-server](https://github.com/indexzero/http-server). 
> Para gerar uma chave no [bing maps](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key)

3. Altere e renomeie `data-src/Colocalizados.sample.xlsx` para `data-src/Colocalizados.xlsx` e altere a tabela `output` com as informações do projeto.

4. Inclua os arquivos em `data-src/projetos/id_nome-do-projeto`. Inclua ao menos um arquivo `.kml` em cada diretório criado.

5. Rode o comando:

```
npm run files
```

6. Inicie a aplicação para desenvolvimento
```
npm run start
```

7. Publique o projeto no diretório `dist/`
``` 
npm run build
```

8. Observe arquivos em local de deploy
```
npm run watch
```

9. Visualize e desenvolva testes unitários (qunit)
```
npm run tests
```

10. Personalize estilos alterando o nome do kml 
```
# arquivo nome do arquivo .kml
data-src/projetos/nome-do-projeto/arquivo-kml_custom-dashed.kml

# src/layers/projectsKmls.js aletere a constante customStyles 
const customStyles = [...'custom-dashed']

```
e crie o estilo 
```
if (file.extension === '.kml' && isCustom === 'custom-dashed') {
    var style = new Style({
        stroke: new Stroke({
            color: [0, 0, 0, 1],
            width: 1.5,
            lineDash: [.1, 5]
        })
    })
}
```