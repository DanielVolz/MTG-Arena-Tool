const db = require("../shared/database");
const pd = require("../shared/player-data");
const { cardHasType } = require("../shared/card-types.js");
const { createDiv, queryElements: $$ } = require("../shared/dom-fns");
const { getCardImage } = require("../shared/util");

let renderer = 0;

exports.setRenderer = value => {
  renderer = value;
};

// Attaches a hover event to any DOM element.
// Howver over the element with the mouse pops up
// card info for `card`
exports.addCardHover = addCardHover;
function addCardHover(element, card) {
  if (!card || !card.images || card.type == "Special") return;

  element.addEventListener("mouseover", () => {
    $$(".loader, .main_hover").forEach(element => (element.style.opacity = 1));

    // Split cards are readable both halves, no problem
    if (card.dfc != "None" && card.dfc != "SplitHalf" && renderer == 0) {
      $$(".loader_dfc, .main_hover_dfc").forEach(el => {
        show(el);
        el.style.opacity = 1;
      });

      var dfcCard = db.card(card.dfcId);
      var dfcCardImage = getCardImage(dfcCard);

      var dfcImageElement = $$(".main_hover_dfc")[0];
      dfcImageElement.src = dfcCardImage;
      dfcImageElement.addEventListener("load", () => {
        $$(".loader_dfc").forEach(el => (el.style.opacity = 0));
      });
    } else {
      $$(".main_hover_dfc, .loader_dfc").forEach(hide);
    }

    var mainImageElement = $$(".main_hover")[0];
    mainImageElement.src = getCardImage(card);
    mainImageElement.addEventListener("load", () => {
      $$(".loader").forEach(el => (el.style.opacity = 0));
    });

    // show card quantity
    if (renderer == 0) {
      attachOwnerhipStars(card, $$(".hover_card_quantity")[0]);
    }
  });

  element.addEventListener("mouseleave", () => {
    $$(
      ".hover_card_quantity, .main_hover, .main_hover_dfc, .loader, .loader_dfc"
    ).forEach(element => (element.style.opacity = 0));
  });
}

function show(element, mode) {
  if (!mode) {
    mode = "block";
  }
  element.style.display = mode;
  return element;
}

function hide(element) {
  element.style.display = "none";
  return element;
}

exports.attachOwnerhipStars = attachOwnerhipStars;
function attachOwnerhipStars(card, starContainer) {
  let isbasic = cardHasType(card, "Basic Land");
  starContainer.innerHTML = "";
  starContainer.style.opacity = 1;

  const owned = pd.cards.cards[card.id];
  const acquired = pd.cardsNew[card.id];

  if (isbasic) {
    // Show infinity for basics (should work for rats and petitioners?)
    if (owned > 0) starContainer.title = `∞ copies in collection`;
    else starContainer.title = `0 copies in collection`;
    if (acquired) {
      starContainer.title += ` (∞ recent)`;
    }

    let color = "gray";
    if (owned > 0) color = "green";
    if (acquired > 0) color = "orange";

    starContainer.appendChild(createDiv([`inventory_card_infinity_${color}`]));
  } else {
    starContainer.title = `${owned || 0}/4 copies in collection`;
    if (acquired) {
      starContainer.title += ` (${acquired} recent)`;
    }

    for (let i = 0; i < 4; i++) {
      let color = "gray";

      if (i < owned) color = "green";
      if (acquired && i >= owned - acquired && i < owned) color = "orange";

      starContainer.appendChild(
        createDiv([`inventory_card_quantity_${color}`])
      );
    }
  }
}
