(function () {
  "use strict";

  var TIPOS = {
    H: { nome: "Hidratação", cor: "#4db6e2" },
    N: { nome: "Nutrição", cor: "#e2a24d" },
    R: { nome: "Reconstrução", cor: "#b76ed6" }
  };

  var DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

  var CHAVE = "cronograma-capilar-v2";

  var estado = carregar();
  var selecionada = 0;

  function novaSemana() {
    return { tipo: "H", dias: [], produtos: [], feita: false };
  }

  function carregar() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo && Array.isArray(salvo.semanas) && salvo.semanas.length > 0) {
        return {
          semanas: salvo.semanas.map(function (s) {
            return {
              tipo: TIPOS[s.tipo] ? s.tipo : "H",
              dias: Array.isArray(s.dias) ? s.dias : [],
              produtos: Array.isArray(s.produtos) ? s.produtos : [],
              feita: !!s.feita
            };
          }),
          ciclo: salvo.ciclo || 1
        };
      }
    } catch (e) {}
    return { semanas: [novaSemana(), novaSemana(), novaSemana(), novaSemana()], ciclo: 1 };
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {}
  }

  var dashboard = document.getElementById("dashboard-semanas");
  var barra = document.getElementById("barra-progresso");
  var progressoTexto = document.getElementById("progresso-texto");
  var cicloTitulo = document.getElementById("ciclo-titulo");
  var painel = document.getElementById("painel-semana");
  var painelTitulo = document.getElementById("painel-titulo");
  var selectTipo = document.getElementById("select-tipo");
  var chipsDias = document.getElementById("chips-dias");
  var inputProduto = document.getElementById("input-produto");
  var btnAddProduto = document.getElementById("btn-adicionar-produto");
  var listaProdutos = document.getElementById("lista-produtos");
  var btnConcluir = document.getElementById("btn-concluir");
  var btnReset = document.getElementById("btn-reset");
  var inputSemanas = document.getElementById("input-semanas");

  function montarSelectTipo() {
    selectTipo.innerHTML = "";
    Object.keys(TIPOS).forEach(function (chave) {
      var opt = document.createElement("option");
      opt.value = chave;
      opt.textContent = TIPOS[chave].nome;
      selectTipo.appendChild(opt);
    });
  }

  function todasFeitas() {
    return estado.semanas.every(function (s) { return s.feita; });
  }

  function concluirCiclo() {
    estado.ciclo++;
    estado.semanas = estado.semanas.map(function () { return novaSemana(); });
    selecionada = 0;
    salvar();
  }

  function renderDashboard() {
    dashboard.innerHTML = "";
    estado.semanas.forEach(function (semana, i) {
      var card = document.createElement("div");
      card.className = "card-semana" + (semana.feita ? " feita" : "") + (i === selecionada ? " ativa" : "");

      var numero = document.createElement("div");
      numero.className = "semana-numero";
      numero.textContent = "Semana " + (i + 1);

      var tipo = document.createElement("div");
      tipo.className = "etapa-tipo";
      tipo.textContent = TIPOS[semana.tipo].nome;
      tipo.style.background = TIPOS[semana.tipo].cor + "22";
      tipo.style.color = TIPOS[semana.tipo].cor;

      var check = document.createElement("div");
      check.className = "check";
      check.textContent = "✓";

      var info = document.createElement("div");
      info.className = "semana-info";
      if (semana.dias.length) {
        info.textContent = semana.dias.join(" · ");
      } else if (semana.produtos.length) {
        info.textContent = semana.produtos.length + " produto(s)";
      } else {
        info.textContent = "Tocar para configurar";
      }

      card.appendChild(numero);
      card.appendChild(tipo);
      card.appendChild(check);
      card.appendChild(info);

      card.addEventListener("click", function () {
        selecionada = i;
        renderDashboard();
        renderPainel();
      });

      dashboard.appendChild(card);
    });
  }

  function renderProgresso() {
    var total = estado.semanas.length;
    var feitas = estado.semanas.filter(function (s) { return s.feita; }).length;
    var pct = total ? Math.round((feitas / total) * 100) : 0;
    barra.style.width = pct + "%";
    progressoTexto.textContent = feitas + " de " + total + " semanas feitas";
    cicloTitulo.textContent = "Ciclo " + estado.ciclo;
  }

  function renderPainel() {
    var semana = estado.semanas[selecionada];
    painel.hidden = false;
    painelTitulo.textContent = "Semana " + (selecionada + 1);
    selectTipo.value = semana.tipo;

    chipsDias.innerHTML = "";
    DIAS.forEach(function (dia) {
      var chip = document.createElement("span");
      chip.className = "chip-dia" + (semana.dias.indexOf(dia) !== -1 ? " ativo" : "");
      chip.textContent = dia;
      chip.addEventListener("click", function () {
        var idx = semana.dias.indexOf(dia);
        if (idx === -1) semana.dias.push(dia);
        else semana.dias.splice(idx, 1);
        salvar();
        renderPainel();
        renderDashboard();
      });
      chipsDias.appendChild(chip);
    });

    listaProdutos.innerHTML = "";
    semana.produtos.forEach(function (produto, idx) {
      var li = document.createElement("li");
      var span = document.createElement("span");
      span.textContent = produto;

      var btn = document.createElement("button");
      btn.className = "btn-remover";
      btn.textContent = "✕";
      btn.addEventListener("click", function () {
        semana.produtos.splice(idx, 1);
        salvar();
        renderPainel();
        renderDashboard();
      });

      li.appendChild(span);
      li.appendChild(btn);
      listaProdutos.appendChild(li);
    });

    btnConcluir.textContent = semana.feita ? "Desmarcar" : "Marcar como feita";
  }

  selectTipo.addEventListener("change", function () {
    estado.semanas[selecionada].tipo = selectTipo.value;
    salvar();
    renderDashboard();
    renderPainel();
  });

  btnAddProduto.addEventListener("click", function () {
    var nome = inputProduto.value.trim();
    if (!nome) return;
    estado.semanas[selecionada].produtos.push(nome);
    inputProduto.value = "";
    salvar();
    renderPainel();
    renderDashboard();
  });

  inputProduto.addEventListener("keydown", function (e) {
    if (e.key === "Enter") btnAddProduto.click();
  });

  btnConcluir.addEventListener("click", function () {
    var semana = estado.semanas[selecionada];
    semana.feita = !semana.feita;
    if (todasFeitas()) {
      concluirCiclo();
      renderDashboard();
      renderPainel();
      renderProgresso();
      return;
    }
    salvar();
    renderPainel();
    renderDashboard();
    renderProgresso();
  });

  btnReset.addEventListener("click", function () {
    if (!confirm("Reiniciar o ciclo atual (voltar para o ciclo 1)?")) return;
    estado.semanas = estado.semanas.map(function () { return novaSemana(); });
    estado.ciclo = 1;
    selecionada = 0;
    salvar();
    renderDashboard();
    renderPainel();
    renderProgresso();
  });

  inputSemanas.addEventListener("change", function () {
    var n = parseInt(inputSemanas.value, 10);
    if (isNaN(n) || n < 1) n = 4;
    if (n > 12) n = 12;
    inputSemanas.value = n;

    while (estado.semanas.length < n) estado.semanas.push(novaSemana());
    estado.semanas = estado.semanas.slice(0, n);
    if (selecionada >= estado.semanas.length) selecionada = 0;

    salvar();
    renderDashboard();
    renderPainel();
    renderProgresso();
  });

  montarSelectTipo();
  inputSemanas.value = estado.semanas.length;
  renderDashboard();
  renderPainel();
  renderProgresso();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(function () {});
  }
})();
