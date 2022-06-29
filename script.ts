interface Veiculo {
  nome: string;
  placa: string;
  entrada: Date | string;
  clientID?: string;
}

(function () {
  const $ = (query: string): HTMLInputElement | null =>
    document.querySelector(query);

  $("#placa").addEventListener("input", function () {
    this.value = this.value.toUpperCase();
    this.value = this.value
      .replace(/^([A-Za-z]{0,2})([^A-Za-z])/,'$1')
      .replace(/^([A-Za-z]{3})([^0-9])/,"$1")
      .replace(/^([A-Za-z]{3}[0-9])([^A-Za-z0-9])/,"$1")
      .replace(/^([A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{0,1})([^0-9])/,"$1")
      .replace(/^(.{7})./,"$1")

    this.value = this.value.replace(
      /([A-Za-z]{3})([0-9])(.)([0-9]{2})/,
      "$1-$2$3$4"
    );
  });

  function calcTempo(mil: number) {
    const min = Math.floor(mil / 60000);
    const sec = Math.floor((mil % 60000) / 1000);
    return `${min}m e ${sec}s`;
  }

  function patio() {
    function ler(): Veiculo[] {
      return localStorage.patio ? JSON.parse(localStorage.patio) : [];
    }

    function adicionar(veiculo: Veiculo, salva?: boolean) {
      const row = document.createElement("tr");

      row.innerHTML = `
            <td>${veiculo.nome}</td>
            <td>${veiculo.placa}</td>
            <td>${veiculo.entrada}</td>
            <td><button class='delete' data-placa=${veiculo.placa}>Deletar</button></td>`;

      row.querySelector(".delete")?.addEventListener("click", function () {
        remover(this.dataset.placa);
      });
      $("#patio")?.appendChild(row);
      if (salva) salvar([...ler(), veiculo]);
    }

    function remover(placa: string) {
      const { entrada, nome } = ler().find((veiculo) => veiculo.placa);

      const tempo = calcTempo(
        new Date().getTime() - new Date(entrada).getTime()
      );

      if (
        !confirm(`O veículo ${nome} permaneceu por ${tempo}. Deseja encerrar?`)
      )
        return;
      salvar(ler().filter((veiculo) => veiculo.placa !== placa));
      render();
    }

    function salvar(veiculos: Veiculo[]) {
      localStorage.setItem("patio", JSON.stringify(veiculos));
    }
    function render() {
      $("#patio")!.innerHTML = "";
      const patio = ler();

      if (patio.length) {
        patio.forEach((veiculo) => adicionar(veiculo));
      }
    }

    return { ler, adicionar, remover, salvar, render };
  }
  patio().render();

  $("#cadastrar")?.addEventListener("click", () => {
    const nome = $("#nome")?.value;
    const placa = $("#placa")?.value;
    const placa_pattern = placa.match(/^(\D{3})\-(\d)(.)(\d{2})/)
    console.log(placa_pattern)
    if (!nome || (!placa && !placa_pattern)) {
      alert("Os campos nome e placa são obrigatórios");
      return;
    }
    patio().adicionar({ nome, placa, entrada: new Date().toISOString() }, true);
  });
})();
