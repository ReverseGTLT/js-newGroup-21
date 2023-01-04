const EDIT_BTN_CLASS = 'editBtn';
const DELETE_BTN_CLASS = 'deleteBtn';
const CONTACT_ITEM_SELECTOR = '.contactItem';

const $form = $('#contactForm');
const $inputs = document.querySelectorAll('.formInput');
const $contactContainer = $('#contactContainer');
let $contactList = [];

//
const $modalOpenBtn = $('.btn-container__open');
const dialog = $( "#contactForm" ).dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
        Cancel: function() {
            dialog.dialog( "close" );
        }
    },
});

$modalOpenBtn.on('click', openModal);
function openModal() {
    dialog.dialog( "open" );
    clearForm();
}
//

$form.on('submit', onAddContactBtnClick);
$contactContainer.on('click', onContactContainerClick);

init();

function init() {
    ContactApi.getList()
        .then((list) => {
            $contactList = list;
            renderContactList(list)
        })
        .catch(showError)
}

function onAddContactBtnClick(e) {
    e.preventDefault();
    const contact = getContact();
    if (!isContactValid(contact)) {
        showError(new Error('Wrong input data'));
        return;
    }
    saveContact(contact);
    clearForm();
    dialog.dialog( "close" );
}

function onContactContainerClick(e) {
    const contactEl = e.target.closest(CONTACT_ITEM_SELECTOR);
    const id = contactEl.dataset.id;
    const contact = findContactById(id);

    if (contact) {
        if (e.target.classList.contains(DELETE_BTN_CLASS)) {
            contactEl.remove();
            ContactApi.delete(id)
                .then((deleteId) => {
                    console.log(deleteId)
            })
        } else if (e.target.classList.contains(EDIT_BTN_CLASS)) {
            dialog.dialog( "open" );
            setFormData(contact);
        }
    }
}

function setFormData(contact) {
    for (const input of $inputs) {
        if (Object.hasOwn(contact, input.name)) {
            input.value = contact[input.name];
        }
    }
}

function getContact() {
    const contact = {};

    for (const { name, value } of $inputs) {
        contact[name] = value;
    }

    return contact;
}

function isContactValid(contact) {
    return !isEmpty(contact.firstName)
        && !isEmpty(contact.lastName)
        && !isEmpty(contact.phone)
        && isPhone(contact.phone);
}

function isEmpty(str) {
    return str === '';
}

function isPhone(phone) {
    return !isNaN(phone);
}

function saveContact(contact) {
    if (contact.id) {
        ContactApi.update(contact.id, contact)
            .then((newContact) => {
                updateKeys(contact.id, newContact);
                clearForm();
            })
            .catch(showError)

        replaceContact(contact.id, contact);
    } else {
        ContactApi.create(contact)
            .then((newContact) => {
                $contactList.push(newContact);
                renderContact(newContact)
                clearForm();
            })
            .catch(showError)
    }

}

function renderContactList(contacts) {
    $contactContainer.html(contacts.map(generateHTML).join(''));
}

function renderContact(contact) {
    const html = generateHTML(contact);

    $contactContainer.append(html);
}

function generateHTML(contact) {
    return `
    <tr class="contactItem" data-id="${contact.id}">
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td>${contact.phone}</td>
      <td>
        <span>
            <button type="button" class="editBtn">[Edit]</button>
            <button type="button" class="deleteBtn">[Delete]</button>
        </span>
      </td>
    </tr>
  `;
}

function clearForm() {
    $form[0].reset();
}

function showError(error) {
    alert(error.message)
}


function findContactById(id) {
    return $contactList.find(item => item.id === id);
}

function updateKeys(id, changes) {
    const oldContact = findContactById(id)

    Object.keys(changes).forEach(key => oldContact[key] = changes[key]);
}

function replaceContact(id, contact) {
    const oldTodoEl = document.querySelector(`[data-id="${id}"]`);
    oldTodoEl.outerHTML = generateHTML(contact);
}