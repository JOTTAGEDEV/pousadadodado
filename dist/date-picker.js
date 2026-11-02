(() => {
  'use strict';
  const instances = new Map();
  const zone = 'America/Sao_Paulo';
  const today = new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit',timeZone:zone}).format(new Date());
  const parse = value => new Date(value + 'T12:00:00Z');
  const iso = date => date.toISOString().slice(0,10);
  const add = (value, amount) => { const date = parse(value); date.setUTCDate(date.getUTCDate()+amount); return iso(date); };
  const short = value => new Intl.DateTimeFormat('pt-BR', {day:'2-digit',month:'short',timeZone:'UTC'}).format(parse(value)).replace('.', '');
  const full = value => new Intl.DateTimeFormat('pt-BR', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(parse(value));
  const monthName = date => new Intl.DateTimeFormat('pt-BR', {month:'long',year:'numeric',timeZone:'UTC'}).format(date);
  const icon = name => name === 'calendar' ? '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/></svg>' : '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>';

  document.querySelectorAll('form').forEach((form, index) => {
    const arrival = form.querySelector('input[name="checkin"]');
    const departure = form.querySelector('input[name="checkout"]');
    if (!arrival || !departure) return;
    form.classList.add('date-picker-host');
    const id = 'stay-calendar-' + index;
    let activeField = 'checkin';
    let visibleMonth = parse((arrival.value || today).slice(0,7) + '-01');
    let opener;
    let hovered = '';
    let draftStart = arrival.value;
    let draftEnd = departure.value;
    const panel = document.createElement('section');
    panel.className = 'date-picker'; panel.id = id; panel.hidden = true;
    panel.setAttribute('aria-label', 'Calendário da estadia');
    panel.innerHTML = '<div class="date-picker-heading"><div><strong>Seus dias por aqui</strong><p class="date-picker-instruction" aria-live="polite"></p></div><button type="button" class="date-picker-close" aria-label="Fechar calendário"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="date-picker-nav"><button type="button" class="date-picker-prev" aria-label="Mês anterior">'+icon('arrow')+'</button><h3 class="date-picker-month" aria-live="polite"></h3><button type="button" class="date-picker-next" aria-label="Próximo mês">'+icon('arrow')+'</button></div><div class="date-picker-weekdays" aria-hidden="true"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div><div class="date-picker-grid" role="group" aria-label="Dias do mês"></div><div class="date-picker-summary" aria-live="polite"></div><p class="date-picker-error" role="alert"></p><div class="date-picker-actions"><button type="button" class="date-picker-clear">Limpar datas</button><button type="button" class="date-picker-apply">Confirmar datas</button></div><p class="date-picker-note">A disponibilidade será confirmada pela pousada.</p>';
    form.append(panel);
    const grid = panel.querySelector('.date-picker-grid');
    const summary = panel.querySelector('.date-picker-summary');
    const error = panel.querySelector('.date-picker-error');
    const apply = panel.querySelector('.date-picker-apply');
    const buttons = {};
    for (const [field,input,title] of [['checkin',arrival,'Chegada'],['checkout',departure,'Saída']]) {
      input.type = 'hidden'; input.required = false;
      const trigger = document.createElement('button');
      trigger.type = 'button'; trigger.className = 'date-trigger';
      trigger.setAttribute('aria-controls',id); trigger.setAttribute('aria-expanded','false');
      trigger.innerHTML = icon('calendar') + '<span></span>';
      input.after(trigger); buttons[field] = trigger;
      trigger.addEventListener('click', e => {e.preventDefault();open(field,trigger);});
      input.addEventListener('change', updateTriggers);
      function updateLabel() {
        trigger.querySelector('span').textContent = input.value ? short(input.value) : 'Selecionar';
        trigger.setAttribute('aria-label',title + (input.value ? ': ' + full(input.value) : ': selecionar data'));
      }
      trigger.updateLabel = updateLabel;
    }
    function updateTriggers() {Object.values(buttons).forEach(button => button.updateLabel());}
    updateTriggers();
    function close(restore = true) {
      panel.hidden = true; Object.values(buttons).forEach(button => button.setAttribute('aria-expanded','false'));
      if (restore && opener?.isConnected) opener.focus({preventScroll:true});
    }
    function open(field = 'checkin', source, message = '') {
      instances.forEach(instance => { if(instance.form !== form) instance.close(false); });
      activeField = field; opener = source || buttons[field];
      draftStart = arrival.value; draftEnd = departure.value; hovered = '';
      visibleMonth = parse(((field === 'checkout' ? draftEnd || draftStart : draftStart) || today).slice(0,7)+'-01');
      panel.hidden = false; Object.values(buttons).forEach(button => button.setAttribute('aria-expanded','true'));
      error.textContent = message; render(); panel.scrollIntoView({block:'nearest',behavior:'auto'});
      const target = field === 'checkout' ? draftEnd || (draftStart ? add(draftStart,1) : today) : draftStart || today;
      focusDate(target);
    }
    function focusDate(value) {
      if(value < today) value = today;
      if(value.slice(0,7) !== iso(visibleMonth).slice(0,7)) {visibleMonth=parse(value.slice(0,7)+'-01');render();}
      const button = grid.querySelector('[data-date="'+value+'"]');
      if(button && !button.disabled){grid.querySelectorAll('button').forEach(item=>item.tabIndex=-1);button.tabIndex=0;button.focus({preventScroll:true});}
    }
    function changeMonth(amount) {
      visibleMonth.setUTCMonth(visibleMonth.getUTCMonth()+amount);
      if(iso(visibleMonth).slice(0,7)<today.slice(0,7)) visibleMonth=parse(today.slice(0,7)+'-01');
      render();
    }
    function rangeEnd() {return draftEnd || (hovered > draftStart ? hovered : '');}
    function updateRange() {
      const end = rangeEnd();
      grid.querySelectorAll('[data-date]').forEach(button => {
        const value = button.dataset.date;
        button.classList.toggle('is-start',value===draftStart);
        button.classList.toggle('is-end',value===draftEnd);
        button.classList.toggle('is-between',!!draftStart && !!end && value>draftStart && value<end);
        button.setAttribute('aria-pressed',String(value===draftStart || value===draftEnd));
      });
    }
    function render() {
      panel.querySelector('.date-picker-month').textContent = monthName(visibleMonth);
      panel.querySelector('.date-picker-prev').disabled = iso(visibleMonth).slice(0,7)<=today.slice(0,7);
      panel.querySelector('.date-picker-instruction').textContent = activeField==='checkin' ? 'Escolha o dia da chegada.' : 'Agora, escolha o dia da saída.';
      grid.replaceChildren();
      const year=visibleMonth.getUTCFullYear(), month=visibleMonth.getUTCMonth();
      const days=new Date(Date.UTC(year,month+1,0,12)).getUTCDate();
      for(let empty=0;empty<visibleMonth.getUTCDay();empty++){const space=document.createElement('span');space.className='date-picker-empty';grid.append(space);}
      for(let day=1;day<=days;day++) {
        const value=iso(new Date(Date.UTC(year,month,day,12)));
        const button=document.createElement('button');button.type='button';button.className='date-picker-day';button.textContent=day;button.dataset.date=value;
        button.disabled=value<today;button.tabIndex=-1;button.setAttribute('aria-label',full(value));
        if(value===today){button.classList.add('is-today');button.setAttribute('aria-current','date');}
        button.addEventListener('click',()=>select(value));
        button.addEventListener('pointerenter',()=>{if(activeField==='checkout'){hovered=value;updateRange();}});
        grid.append(button);
      }
      const focusValue = activeField==='checkout' ? draftEnd || (draftStart ? add(draftStart,1) : today) : draftStart || today;
      const tabbable=grid.querySelector('[data-date="'+focusValue+'"]') || grid.querySelector('button:not(:disabled)');
      if(tabbable)tabbable.tabIndex=0;
      if(draftStart && draftEnd) {
        const nights=Math.round((parse(draftEnd)-parse(draftStart))/86400000);
        summary.textContent=short(draftStart)+' — '+short(draftEnd)+' · '+nights+(nights===1?' noite':' noites');
      } else summary.textContent=draftStart ? 'Chegada em '+short(draftStart)+'. Falta escolher a saída.' : 'Selecione chegada e saída no calendário.';
      apply.disabled=!(draftStart && draftEnd && draftEnd>draftStart);
      updateRange();
    }
    function select(value) {
      error.textContent='';hovered='';
      if(activeField==='checkin' || !draftStart || value<=draftStart){draftStart=value;draftEnd='';activeField='checkout';}
      else {draftEnd=value;}
      render();focusDate(value);
    }
    panel.querySelector('.date-picker-prev').addEventListener('click',()=>changeMonth(-1));
    panel.querySelector('.date-picker-next').addEventListener('click',()=>changeMonth(1));
    panel.querySelector('.date-picker-close').addEventListener('click',()=>close());
    panel.querySelector('.date-picker-clear').addEventListener('click',()=>{draftStart='';draftEnd='';activeField='checkin';arrival.value='';departure.value='';arrival.dispatchEvent(new Event('change',{bubbles:true}));departure.dispatchEvent(new Event('change',{bubbles:true}));error.textContent='';render();});
    apply.addEventListener('click',()=>{
      if(!draftStart || !draftEnd || draftEnd<=draftStart)return;
      arrival.value=draftStart;arrival.dispatchEvent(new Event('change',{bubbles:true}));
      departure.value=draftEnd;departure.dispatchEvent(new Event('change',{bubbles:true}));
      close();
    });
    grid.addEventListener('pointerleave',()=>{hovered='';updateRange();});
    grid.addEventListener('keydown',event=>{
      const value=event.target.dataset.date;if(!value)return;
      let next;
      if(event.key==='ArrowRight')next=add(value,1);
      if(event.key==='ArrowLeft')next=add(value,-1);
      if(event.key==='ArrowDown')next=add(value,7);
      if(event.key==='ArrowUp')next=add(value,-7);
      if(event.key==='Home')next=add(value,-parse(value).getUTCDay());
      if(event.key==='End')next=add(value,6-parse(value).getUTCDay());
      if(event.key==='PageUp' || event.key==='PageDown') {const date=parse(value);const day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+(event.key==='PageUp'?-1:1));const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));next=iso(date);}
      if(next){event.preventDefault();focusDate(next);}
    });
    panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}});
    form.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();close();}});
    document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!Object.values(buttons).some(button=>button.contains(event.target)))close(false);});
    const dialog=form.closest('dialog');if(dialog)dialog.addEventListener('close',()=>close(false));
    instances.set(form,{form,open,close});
  });
  window.PousadaDates={open(form,field='checkin',message=''){const instance=instances.get(form);if(instance)instance.open(field,null,message);}};
})();
