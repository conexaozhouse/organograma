# Fotos do organograma

Coloque aqui as fotos das pessoas, uma por pessoa, com o **id** usado em `js/data.js`:

```
images/organograma/rafael-fabrino.jpg
images/organograma/danilo-zanatta.jpg
...
```

Depois, preencha o campo `photo` da pessoa em `js/data.js`:

```js
"rafael-fabrino": { name: "Rafael Fabrino", photo: "images/organograma/rafael-fabrino.jpg", ... }
```

- Formato: JPG ou WebP, quadrado, mínimo 300×300 px (a foto é recortada em círculo).
- Sem `photo` (ou se o arquivo não existir) o card mostra as iniciais — nada quebra.
- A mesma foto é usada em todos os organogramas em que a pessoa aparece.
