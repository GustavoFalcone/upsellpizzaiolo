# Upsell pós-compra — Fichário Visual de Pizzas

Projeto separado do infoapp e da landing page do Atlas. React + Vite.

## Rodar

`npm install`

`npm run dev`

`npm run build`

## Integrações pendentes

O vídeo real da mini VSL e seu poster ficam em `public/video`; a moldura usa a proporção 576×1248 do arquivo, sem recorte. Editar `src/config.js` com os destinos oficiais (`acceptUrl`, `declineUrl`). Alternativamente, o checkout pode registrar `window.pizzaUpsellAccept` e `window.pizzaUpsellDecline` antes da interação; ambos recebem o query string original. Sem esses destinos, os botões informam o estado pendente e não simulam cobrança nem liberação de acesso. A página preserva parâmetros UTM conhecidos ao abrir os destinos.

`accessStatus` deve continuar como `confirmed` enquanto não houver integração real de processamento. O progresso exibido é apenas visual, persiste em `sessionStorage` por 150 segundos, mostra a porcentagem da apresentação e não representa pagamento.
