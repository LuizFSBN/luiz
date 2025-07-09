document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginMessage = document.getElementById('login-message');
    const studentEmailDisplay = document.getElementById('student-email-display');
    const busScheduleDiv = document.getElementById('bus-schedule');
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackMessageDisplay = document.getElementById('feedback-message-display');
    const logoutButton = document.getElementById('logout-button');
    const myBusBookingsDiv = document.getElementById('my-bus-bookings');

    let siteData = {
        users: [],
        busSchedule: [],
        feedbacks: []
    };
    let currentUser = null; // Para armazenar o usuário logado atualmente

    // Domínio de e-mail acadêmico permitido
    const ACADEMIC_EMAIL_DOMAIN = '@unifesspa.edu.br';

    // Carregar dados do JSON
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            siteData = await response.json();
            console.log('Dados carregados:', siteData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            // Em um ambiente de produção, você pode exibir uma mensagem de erro para o usuário
        }
    }

    // Função de Login
    loginForm.addEventListener('submit', async (event) => {
  // ... dentro do loginForm.addEventListener('submit', async (event) => { ...

    event.preventDefault();
    await loadData();

    const email = document.getElementById('email').value.toLowerCase(); // Converte para minúsculas
    const password = document.getElementById('password').value.trim(); // Adicionamos .trim() aqui para a senha

    console.log("Email digitado (em minúsculas):", email); // LINHA PARA ADICIONAR
    console.log("Domínio acadêmico esperado:", ACADEMIC_EMAIL_DOMAIN); // LINHA PARA ADICIONAR

    // 1. Validação do domínio do e-mail acadêmico
    if (!email.endsWith(ACADEMIC_EMAIL_DOMAIN)) {
        console.log("A condição !email.endsWith(ACADEMIC_EMAIL_DOMAIN) retornou TRUE."); // LINHA PARA ADICIONAR
        loginMessage.textContent = `Por favor, use seu e-mail acadêmico (${ACADEMIC_EMAIL_DOMAIN}).`;
        loginMessage.className = 'message error';
        return; // Impede o prosseguimento do login
    }

    console.log("A condição !email.endsWith(ACADEMIC_EMAIL_DOMAIN) retornou FALSE (email parece válido)."); // LINHA PARA ADICIONAR

    // 2. Validação das credenciais (usuário e senha)
    currentUser = siteData.users.find(u => u.email === email && u.password === password);

    // ... o resto do seu código de login ...

        if (currentUser) {
            loginMessage.textContent = 'Login realizado com sucesso!';
            loginMessage.className = 'message success';
            // Esconde a seção de login e mostra o dashboard
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            studentEmailDisplay.textContent = email; // Exibe o e-mail do aluno logado
            renderBusSchedule(); // Carrega e exibe os horários de ônibus
            renderMyBookings(); // Carrega e exibe os agendamentos do usuário
        } else {
            loginMessage.textContent = 'E-mail ou senha incorretos. Verifique suas credenciais.';
            loginMessage.className = 'message error';
        }
    });

    // Renderizar Horários de Ônibus
    function renderBusSchedule() {
        if (siteData.busSchedule.length === 0) {
            busScheduleDiv.innerHTML = '<p>Nenhum horário de ônibus disponível no momento.</p>';
            return;
        }

        const ul = document.createElement('ul');
        siteData.busSchedule.forEach(schedule => {
            schedule.times.forEach(time => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${schedule.route}</strong> - ${time}<br>
                    Dias: ${schedule.days.join(', ')}
                    <button class="book-bus-btn"
                            data-route="${schedule.route}"
                            data-time="${time}"
                            data-days="${schedule.days.join(', ')}">Agendar</button>
                `;
                ul.appendChild(li);
            });
        });
        busScheduleDiv.innerHTML = ''; // Limpa o conteúdo existente antes de adicionar os novos
        busScheduleDiv.appendChild(ul);

        // Adicionar event listeners para os botões de agendamento APÓS eles serem criados
        document.querySelectorAll('.book-bus-btn').forEach(button => {
            button.addEventListener('click', handleBusBooking);
        });
    }

    // Função para lidar com o agendamento do ônibus
    function handleBusBooking(event) {
        if (!currentUser) {
            alert('Você precisa estar logado para agendar um ônibus.');
            return;
        }

        const button = event.target;
        const route = button.dataset.route;
        const time = button.dataset.time;
        const days = button.dataset.days; // Dias em string separada por vírgula

        const booking = {
            route: route,
            time: time,
            days: days,
            timestamp: new Date().toLocaleString()
        };

        // Simulação de agendamento: adiciona ao array de bookings do usuário logado
        // Em um sistema real, isso enviaria dados para um backend e um banco de dados
        currentUser.bookings.push(booking);
        alert(`Ônibus agendado: ${route} às ${time}`);
        console.log('Novo agendamento:', booking);
        console.log('Agendamentos do usuário:', currentUser.bookings);

        renderMyBookings(); // Atualiza a lista de agendamentos do usuário na interface
    }

    // Renderizar Meus Agendamentos
    function renderMyBookings() {
        const myBookingsList = myBusBookingsDiv.querySelector('ul') || document.createElement('ul');
        myBookingsList.innerHTML = ''; // Limpa a lista existente

        if (!currentUser || currentUser.bookings.length === 0) {
            myBusBookingsDiv.innerHTML = '<p>Nenhum agendamento ainda.</p>';
            return;
        }

        currentUser.bookings.forEach(booking => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${booking.route}</strong> - ${booking.time}<br>
                Dias: ${booking.days}<br>
                <em>Agendado em: ${booking.timestamp}</em>
            `;
            myBookingsList.appendChild(li);
        });
        myBusBookingsDiv.innerHTML = ''; // Limpa o conteúdo existente antes de adicionar a lista
        myBusBookingsDiv.appendChild(myBookingsList);
    }

    // Envio de Feedback
    feedbackForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const feedbackType = document.getElementById('feedback-type').value;
        const feedbackMessage = document.getElementById('feedback-message').value;
        const studentEmail = studentEmailDisplay.textContent; // Pega o email do aluno logado

        if (feedbackMessage.trim() === '') {
            feedbackMessageDisplay.textContent = 'Por favor, digite sua mensagem de feedback.';
            feedbackMessageDisplay.className = 'message error';
            return;
        }

        const newFeedback = {
            email: studentEmail,
            type: feedbackType,
            message: feedbackMessage,
            timestamp: new Date().toLocaleString()
        };

        // Simulação de armazenamento: adiciona ao array de feedbacks
        // Em um sistema real, isso enviaria dados para um backend
        siteData.feedbacks.push(newFeedback);
        console.log('Novo Feedback:', newFeedback);
        console.log('Todos os Feedbacks:', siteData.feedbacks);

        feedbackMessageDisplay.textContent = 'Feedback enviado com sucesso! Agradecemos sua contribuição.';
        feedbackMessageDisplay.className = 'message success';
        feedbackForm.reset(); // Limpa o formulário após o envio
    });

    // Botão de Logout
    logoutButton.addEventListener('click', () => {
        dashboardSection.classList.add('hidden'); // Esconde o dashboard
        loginSection.classList.remove('hidden'); // Mostra a seção de login
        loginForm.reset(); // Limpa o formulário de login
        loginMessage.textContent = ''; // Limpa a mensagem de login
        feedbackMessageDisplay.textContent = ''; // Limpa a mensagem de feedback
        currentUser = null; // Limpa o usuário logado
    });

    // Carregar dados do JSON na inicialização da página
    loadData();
});