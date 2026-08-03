(() => {
  'use strict';

  const form = document.getElementById('aiDiagnosisForm');
  if (!form) return;

  const MAX_BYTES = 15 * 1024 * 1024;
  const allowedMimes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
  const allowedExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);
  const status = document.getElementById('formStatus');
  const submit = document.getElementById('formSubmit');
  const fileInput = form.elements.attachment;
  const fileSelection = document.getElementById('fileSelection');
  const title = document.getElementById('diagnosis-title');

  const typeCopy = {
    'ai-diagnosis': '無料AI診断のお申し込み',
    'document-request': '資料請求・お問い合わせ',
    general: 'お問い合わせ'
  };
  const requestedType = new URLSearchParams(location.search).get('type');
  const type = Object.hasOwn(typeCopy, requestedType) ? requestedType : 'ai-diagnosis';
  form.elements.inquiry_type.value = type;
  if (title) title.textContent = typeCopy[type];

  const setStatus = (message, kind = '') => {
    status.textContent = message;
    status.className = `form-status${kind ? ` is-${kind}` : ''}`;
  };

  const setFieldError = (name, message = '') => {
    const target = form.querySelector(`[data-error-for="${name}"]`);
    const control = form.elements[name];
    if (target) target.textContent = message;
    if (control && control.setAttribute) control.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const clearErrors = () => {
    form.querySelectorAll('[data-error-for]').forEach((node) => { node.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach((node) => node.setAttribute('aria-invalid', 'false'));
  };

  const validateFile = () => {
    const file = fileInput.files?.[0];
    setFieldError('attachment');
    if (!file) return true;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (file.size > MAX_BYTES) {
      setFieldError('attachment', '添付ファイルは15MB以内にしてください。');
      return false;
    }
    if (!allowedExtensions.has(extension) || (file.type && !allowedMimes.has(file.type))) {
      setFieldError('attachment', 'PDF、JPG、PNG、WebPのみ添付できます。');
      return false;
    }
    return true;
  };

  const updateFileLabel = () => {
    const file = fileInput.files?.[0];
    fileSelection.textContent = file
      ? `${file.name}（${(file.size / 1024 / 1024).toFixed(2)}MB）`
      : 'ファイルは選択されていません';
    validateFile();
  };

  const validate = () => {
    clearErrors();
    let valid = true;
    const required = {
      contact_name: 'ご担当者名を入力してください。',
      email: '正しいメールアドレスを入力してください。',
      phone: '電話番号を入力してください。',
      message: 'ご相談内容を10文字以上で入力してください。',
      privacy_consent: 'プライバシーポリシーへの同意が必要です。'
    };
    for (const [name, message] of Object.entries(required)) {
      const control = form.elements[name];
      const empty = control.type === 'checkbox' ? !control.checked : !control.value.trim();
      if (empty || !control.validity.valid) {
        setFieldError(name, message);
        valid = false;
      }
    }
    const email = form.elements.email;
    if (email.value && !email.validity.valid) {
      setFieldError('email', '正しいメールアドレスを入力してください。');
      valid = false;
    }
    if (form.elements.message.value.trim().length < 10) {
      setFieldError('message', 'ご相談内容を10文字以上で入力してください。');
      valid = false;
    }
    return validateFile() && valid;
  };

  const loadToken = async (clearStatus = true) => {
    try {
      const response = await fetch('api/form-token.php', { credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error('token');
      form.elements.csrf_token.value = data.csrf_token;
      form.elements.form_started_at.value = data.form_started_at;
      submit.disabled = false;
      if (clearStatus) setStatus('');
    } catch (_) {
      form.elements.csrf_token.value = '';
      form.elements.form_started_at.value = '';
      submit.disabled = true;
      setStatus('フォームを準備できませんでした。ページを再読み込みしてください。', 'error');
    }
  };

  fileInput.addEventListener('change', updateFileLabel);
  const dropZone = form.querySelector('.file-field');
  dropZone?.addEventListener('dragover', (event) => event.preventDefault());
  dropZone?.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    updateFileLabel();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validate()) {
      setStatus('入力内容をご確認ください。', 'error');
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    submit.disabled = true;
    submit.textContent = '送信中…';
    setStatus('添付資料を含め、安全に送信しています。');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        if (data.fields) Object.entries(data.fields).forEach(([name, message]) => setFieldError(name, message));
        throw new Error(data.error || '送信できませんでした。');
      }
      form.reset();
      updateFileLabel();
      setStatus('送信しました。1営業日以内に担当者からご連絡します。', 'success');
      await loadToken(false);
    } catch (error) {
      setStatus(error.message || '送信できませんでした。時間をおいて再度お試しください。', 'error');
      await loadToken(false);
    } finally {
      submit.disabled = !form.elements.csrf_token.value;
      submit.textContent = '内容を送信する';
    }
  });

  submit.disabled = true;
  loadToken();
})();
