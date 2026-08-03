(function () {
  "use strict";

  var TIPOS = {
    H: { nome: "Hidratação", cor: "#4db6e2" },
    N: { nome: "Nutrição", cor: "#e2a24d" },
    R: { nome: "Reconstrução", cor: "#b76ed6" }
  };

  var CHAVE = "cronograma-capilar-v1";

  var estado = carregar();

  function carregar() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo && Array.isArray(salvo.etapas) && salvo.etapas.length > 0) {
        return salvo;
      }
    } catch (e) {}
    return {
      etapas: ["H", "H", "N", "R"],
      feitas: [false, false, false, false],
      ciclo: 1
    };
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {}
  }

  var lista = document.getElementById("lista-etapas");
  var barra = document.getElementById("barra-progresso");
  var progressoTexto = document.getElementById("progresso-texto");
  var cicloTitulo = document.getElementById("ciclo-titulo");
  var inputSemanas = document.getElementById("input-semanas");
  var editor = document.getElementById("editor-etapas");
  var btnAplicar = document.getElementById("btn-aplicar");
  var btnReset = document.getElementById("btn-reset");

  function renderEtapas() {
    lista.innerHTML = "";
    estado.etapas.forEach(function (tipo, i) {
      var li = document.createElement("li");
      li.className = estado.feitas[i] ? "feita" : "";

      var check = document.createElement("div");
      check.className = "check";
      check.textContent = "✓";

      var nome = document.createElement("span");
      nome.className = "etapa-nome";
      nome.textContent = "Semana " + (i + 1);

      var tipoBadge = document.createElement("span");
      tipoBadge.className = "etapa-tipo";
      tipoBadge.textContent = TIPOS[tipo].nome;
      tipoBadge.style.background = TIPOS[tipo].cor + "22";
      tipoBadge.style.color = TIPOS[tipo].cor;

      li.appendChild(check);
      li.appendChild(nome);
      li.appendChild(tipoBadge);

      li.addEventListener("click", function () {
        estado.feitas[i] = !estado.feitas[i];
        if (todasFeitas()) {
          estado.ciclo++;
          estado.feitas = estado.etapas.map(function () { return false; });
        }
        salvar();
        renderEtapas();
        renderProgresso();
      });

      lista.appendChild(li);
    });
  }

  function todasFeitas() {
    return estado.feitas.every(Boolean);
  }

  function renderProgresso() {
    var total = estado.etapas.length;
    var feitas = estado.feitas.filter(Boolean).length;
    var pct = total ? Math.round((feitas / total) * 100) : 0;
    barra.style.width = pct + "%";
    progressoTexto.textContent = feitas + " de " + total + " etapas feitas";
    cicloTitulo.textContent = "Ciclo " + estado.ciclo;
  }

  function renderEditor() {
    editor.innerHTML = "";
    inputSemanas.value = estado.etapas.length;
    estado.etapas.forEach(function (tipo, i) {
      var linha = document.createElement("div");
      linha.className = "linha-editor";

      var label = document.createElement("span");
      label.textContent = "Semana " + (i + 1);

      var select = document.createElement("select");
      Object.keys(TIPOS).forEach(function (chave) {
        var opt = document.createElement("option");
        opt.value = chave;
        opt.textContent = TIPOS[chave].nome;
        if (chave === tipo) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener("change", function () {
        estado.etapas[i] = select.value;
        salvar();
        renderEtapas();
        renderProgresso();
      });

      linha.appendChild(label);
      linha.appendChild(select);
      editor.appendChild(linha);
    });
  }

  inputSemanas.addEventListener("change", function () {
    var n = parseInt(inputSemanas.value, 10);
    if (isNaN(n) || n < 1) n = 4;
    if (n > 12) n = 12;
    inputSemanas.value = n;

    while (estado.etapas.length < n) estado.etapas.push("H");
    estado.etapas = estado.etapas.slice(0, n);
    while (estado.feitas.length < n) estado.feitas.push(false);
    estado.feitas = estado.feitas.slice(0, n);

    renderEditor();
    renderEtapas();
    renderProgresso();
  });

  btnAplicar.addEventListener("click", function () {
    renderEtapas();
    renderProgresso();
  });

  btnReset.addEventListener("click", function () {
    if (!confirm("Reiniciar o ciclo atual (voltar para o ciclo 1)?")) return;
    estado.feitas = estado.etapas.map(function () { return false; });
    estado.ciclo = 1;
    salvar();
    renderEtapas();
    renderProgresso();
  });

  renderEditor();
  renderEtapas();
  renderProgresso();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(function () {});
  }
})();
