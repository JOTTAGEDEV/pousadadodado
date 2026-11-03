---
name: Pousada do Dado
description: Grafite, laranja e fotografias reais da pousada.
colors:
  primary: "#ff934f"
  primary-hover: "#ffab75"
  background: "#292b2d"
  surface: "#343638"
  surface-deep: "#202224"
  foreground: "#faf9f6"
  muted: "#c4c5c6"
  line: "#55585a"
  button-text: "#242628"
typography:
  display:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "clamp(40px,4.55vw,72px)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "clamp(32px,3.5vw,54px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.7
rounded:
  control: "6px"
  photo: "8px"
  dialog: "12px"
spacing:
  gutter: "clamp(22px,5vw,76px)"
  section: "80px"
  section-mobile: "55px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.button-text}"
    rounded: "{rounded.control}"
    padding: "14px 25px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-contact:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
---

# Design System: Pousada do Dado

## Overview

Grafite e laranja, conforme a direção escolhida. Fotografias reais das acomodações e do destino recebem mais espaço que elementos decorativos. A marca existente permanece no cabeçalho e no rodapé.

## Colors

Laranja identifica ações de reserva e o encerramento da página. Grafite forma o fundo; superfícies ligeiramente mais claras separam acomodações, galeria e formulário. Branco suave identifica títulos; cinza claro identifica texto secundário. O bloco da casa usa fundo grafite e texto claro.

## Typography

DM Sans local em títulos, texto e controles. Os títulos têm peso 600 e espaçamento compacto; destaques em `em` não usam itálico. Corpo base de 16px, com texto de conteúdo entre 14px e 17px. A abertura móvel usa `clamp(36px,9.8vw,56px)`. Algumas seções mantêm tamanhos específicos do CSS base; consultar a cascata antes de generalizar o tamanho de título.

## Layout

Contêiner central com largura máxima de 1380px e margens fluidas. Abertura em duas colunas, texto à esquerda e fotografia à direita. Abaixo de 680px, a abertura e as acomodações ficam em uma coluna; datas permanecem em duas colunas. O formulário superior passa a bloco abaixo de 1100px. Espaçamento vertical de seção de 80px, reduzido para 55px em telas pequenas.

## Elevation & Depth

A separação principal vem da cor das superfícies e de divisórias finas. O botão flutuante de WhatsApp tem sombra suave deslocada (`0 6px 22px #0003`). Foco de teclado usa contorno laranja de 2px, afastado 6px. Seleção usa laranja com texto escuro.

## Shapes

Controles e fotos da galeria têm cantos discretos; fotos de acomodações e faixa de datas usam raio de 8px. A fotografia de abertura tem canto superior esquerdo amplo: 120px no desktop e 65px no celular. Diálogos usam raio de 12px. Ícones são SVG de traço consistente.

## Components

Botões principais usam laranja e texto escuro; hover clareia o laranja. O encerramento usa botão grafite sobre fundo laranja. Datas usam calendário próprio em português, seleção de período com destaque laranja e resumo de noites. O painel se expande dentro do formulário para caber no celular e no diálogo. Hóspedes usa seleção nativa escura. O formulário informa que a consulta pelo WhatsApp não confirma a reserva. Links externos de Airbnb e Booking complementam o contato direto. Galeria tem filtros e visualização ampliada; perguntas frequentes usam details/summary. Os elementos de conteúdo permanecem visíveis sem animações de entrada; a preferência por movimento reduzido é respeitada.

## Do's and Don'ts

- Do manter a paleta grafite e laranja e a marca da pousada.
- Do usar fotografias reais e rótulos claros nas ações de reserva.
- Don't adicionar avaliações ou depoimentos inventados.
- Don't retornar a slogans em itálico ou texto claro sobre a superfície clara do bloco da casa.
