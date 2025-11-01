document.addEventListener('DOMContentLoaded', () => {

    // Lógica para mostrar o nome do usuário logado
    const userDataJson = sessionStorage.getItem('usuarioLogado');

    if (userDataJson) {
        const userData = JSON.parse(userDataJson);
        const nomeUsuarioElement = document.getElementById('nome-usuario');
        
        if (nomeUsuarioElement && userData.username) {
            const nomeCompleto = userData.username;
            const partesDoNome = nomeCompleto.split(' ');
            const primeiroNome = partesDoNome[0];
            
            nomeUsuarioElement.textContent = primeiroNome + '!'; 
        }
    } else {
        alert('Por favor, faça login para acessar o mapa.');
        window.location.href = 'index.html';
        return; 
    }
    
    // Mapa e pesquisa de endereço
    const geoSearchProvider = new GeoSearch.OpenStreetMapProvider();
    let map;

    if (document.getElementById('mapa-container')) {
        map = L.map('mapa-container').setView([20, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const searchControl = new GeoSearch.GeoSearchControl({
            provider: geoSearchProvider,
            style: 'bar', 
            showMarker: false, 
            autoClose: true,
            keepResult: true,
            searchLabel: 'Digite um endereço...'
        });
        map.addControl(searchControl);

        window.myMap = map; 
    }

    // Popups de detalhes, manipualação de ícones e marcadores

    // Popup detalhes
    const popupContainer = document.getElementById('popup-detalhes-container');
    const popupConteudo = document.querySelector('.popup-detalhes-conteudo'); 
    const popupForm = document.getElementById('popup-detalhes-form');
    const popupCloseBtn = document.getElementById('popup-detalhes-fechar');
    const popupIconImg = document.getElementById('popup-detalhes-icone');
    
    // Imagem preview
    const fileInput = document.getElementById('popup-detalhes-foto');
    const previewImage = document.querySelector('.popup-detalhes-upload-area img');
    const placeholderSrc = previewImage.src; 

    // Manipulação de marcadores e ícones
    const menuContexto = document.getElementById('editar-excluir-container');
    const btnMenuEditar = document.getElementById('editar');
    const btnMenuExcluir = document.getElementById('excluir');

    let marcadorAtivo = null;
    
    fileInput.addEventListener('change', function() {
        const file = this.files[0]; 
        if (file) {
            const reader = new FileReader(); 
            reader.onload = (e) => {
                previewImage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });


    if (window.myMap) {

        map.on('click', () => {
            menuContexto.classList.add('popup-escondido');
        });

        const mapContainer = document.getElementById('mapa-container');
        const icons = document.querySelectorAll('.draggable-icon');

        icons.forEach(icon => {
            icon.addEventListener('dragstart', (e) => {
                const data = { id: e.target.id, src: e.target.src };
                e.dataTransfer.setData('application/json', JSON.stringify(data));
            });
        });

        mapContainer.addEventListener('dragover', (e) => {
            e.preventDefault(); 
        });

        mapContainer.addEventListener('drop', (e) => {
            e.preventDefault();

            menuContexto.classList.add('popup-escondido');

            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const iconSrc = data.src;
            const latLng = map.mouseEventToLatLng(e); 
            
            const customIcon = L.icon({
                iconUrl: iconSrc,
                iconSize: [33, 45],
                iconAnchor: [16, 32], 
            });

            const marker = L.marker(latLng, { 
                icon: customIcon,
                draggable: true 
            }).addTo(map);

            marker.dados = {
                tipo: data.id,
                titulo: "",
                descricao: "",
                foto: null
            };

            marcadorAtivo = marker;

            popupForm.reset(); 
            previewImage.src = placeholderSrc;
            popupIconImg.src = iconSrc; 
            
            popupContainer.classList.remove('popup-escondido'); 
            popupConteudo.classList.add('ativo'); 
            

            // Clique ESQUERDO no marcador/icone
            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                menuContexto.classList.add('popup-escondido');
                
                const dados = marker.dados;

                if (!dados.titulo) {
                    return;
                }

                let popupConteudoHTML = `<b>${dados.titulo}</b><br>${dados.descricao}`;

                if (dados.foto) {
                    popupConteudoHTML += `<br><img src="${dados.foto}" alt="${dados.titulo}" style="width: 100px; margin-top: 10px; border-radius: 5px;">`;
                }

                L.popup()
                    .setLatLng(marker.getLatLng())
                    .setContent(popupConteudoHTML)
                    .openOn(map);
            });


            // Clique DIREITO no marcador/icone
            marker.on('contextmenu', (e) => { 
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);

                marcadorAtivo = marker;

                // Posiciona o menu de manipulação próximo ao cursor
                const mapRect = mapContainer.getBoundingClientRect();
                const point = e.containerPoint;
                menuContexto.style.left = `${mapRect.left + point.x}px`;
                menuContexto.style.top = `${mapRect.top + point.y}px`;

                menuContexto.classList.remove('popup-escondido');
            });
        });
    }

    // Botões de manipulação dos marcadores (Editar / Excluir)

    // Editar
    btnMenuEditar.addEventListener('click', () => {
        if (!marcadorAtivo) return;

        const dados = marcadorAtivo.dados;
        
        document.getElementById('popup-detalhes-titulo').value = dados.titulo;
        document.getElementById('popup-detalhes-observacao').value = dados.descricao;
        document.getElementById('popup-detalhes-icone').src = marcadorAtivo.options.icon.options.iconUrl;

        if (dados.foto) {
            previewImage.src = dados.foto;
        } else {
            previewImage.src = placeholderSrc;
        }
        fileInput.value = "";

        popupContainer.classList.remove('popup-escondido');
        popupConteudo.classList.add('ativo');

        menuContexto.classList.add('popup-escondido');
    });

    // Excluir
    btnMenuExcluir.addEventListener('click', () => {
        if (!marcadorAtivo) return;

        // Remove o marcador do mapa
        map.removeLayer(marcadorAtivo);
        
        menuContexto.classList.add('popup-escondido');
        marcadorAtivo = null;
    });


    // Botões e ações do popup de detalhes

    // Botão de enviar
    popupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (marcadorAtivo) {
            const titulo = document.getElementById('popup-detalhes-titulo').value;
            const observacao = document.getElementById('popup-detalhes-observacao').value;

            marcadorAtivo.dados.titulo = titulo;
            marcadorAtivo.dados.descricao = observacao;
            
            if (fileInput.files[0]) { 
                marcadorAtivo.dados.foto = previewImage.src; 
            }

            popupContainer.classList.add('popup-escondido');
            popupConteudo.classList.remove('ativo'); 
            
            popupForm.reset();
            previewImage.src = placeholderSrc;

            marcadorAtivo = null; 
        }
    });

    // Botão X de fechar
    popupCloseBtn.addEventListener('click', () => {
        popupContainer.classList.add('popup-escondido');
        popupConteudo.classList.remove('ativo');
        
        if (marcadorAtivo && !marcadorAtivo.dados.titulo) { 
            map.removeLayer(marcadorAtivo);
        }

        popupForm.reset();
        previewImage.src = placeholderSrc;

        marcadorAtivo = null; 
    });

});