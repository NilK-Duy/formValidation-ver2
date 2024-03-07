
function Validator(formSelector, options = {} ) {
  const _this = this

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement
      }
      element = element.parentElement
    }
  }

  let formRules = {}

  let validatorRules = {
    required: function(value) {
      return value ? undefined : 'Please re-enter'
    },
    email: function(value) {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      return regex.test(value) ? undefined : 'This field must be email'
    },
    min: function(min) {
      return function(value) {
        return value.length >= min ? undefined : `Please enter a minimum of ${min} characters`
      }
    },
    max: function(max) {
      return function(value) {
        return value.length <= max ? undefined : `Please enter a minimum of ${max} characters`
      }
    }
  }

  // Lay ra form element trong DOM theo formSelector
  const formElement = document.querySelector(formSelector)

  // Chi xử lý khi có element trong DOM
  if (formElement) {
    const inputs = formElement.querySelectorAll('[name][rules]')
    for (let input of inputs) {

      const rules = input.getAttribute('rules').split('|')
      for (let rule of rules) {
        let ruleInfor
        const isRuleHasValue = rule.includes(':')

        if (isRuleHasValue) {
          ruleInfor = rule.split(':')
          rule = ruleInfor[0]
        }

        let ruleFunc = validatorRules[rule]

        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleInfor[1])
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc)
        } else {
          formRules[input.name] = [ruleFunc]
        }
      }

      // Lang nghe su kien de validate (blur, change, ...)

      input.onblur = handleValidate
      input.oninput = handleClearError
    }

    // Ham thuc hien validate
    function handleValidate(event) {
      const rules = formRules[event.target.name]
      let errorMessage

      for (let rule of rules) {
        errorMessage = rule(event.target.value)
        if (errorMessage) break
      }

      // Neu co loi thi hien thi message loi ra UI
      if (errorMessage) {
        const formGroup = getParent(event.target, '.form-group')
        if (formGroup) {
          formGroup.classList.add('invalid')
          const formMessage = formGroup.querySelector('.form-message')
          if (formMessage) {
            formMessage.innerText = errorMessage
          } 
        }
      }
      return !errorMessage
    }

    // Ham clear message loi
    function handleClearError(event) {
      const formGroup = getParent(event.target, '.form-group')
      if (formGroup.classList.contains('invalid')) {
        formGroup.classList.remove('invalid')
        const formMessage = formGroup.querySelector('.form-message')

        if (formMessage) {
          formMessage.innerText = ''
        }
      }
    }
  }

  // Xu ly hanh vi submit form
  formElement.onsubmit = function (event) {
    event.preventDefault()

    const inputs = formElement.querySelectorAll('[name][rules]')
    let isValid = true

    for (let input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false
      }
    }

    // Khi khong co loi thi submit form
    if (isValid) {
      if (typeof _this.onSubmit === 'function') {
        const enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
          const formValues = [...enableInputs].reduce(function (values, input) {

            switch(input.type) {
              case 'radio':
                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                break
              case 'checkbox':
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = []
                }
                if (!input.matches(':checked')) {
                  return values
                }
                values[input.name].push(input.value)
                break
              case 'file':
                values[input.name] = input.files
                break
              default:
                values[input.name] = input.value
            }
            return values
          }, {})

        // Goi lai ham onSubmit va truyen gia tri cua form
        _this.onSubmit(formValues)
      } else {
        formElement.submit()
      }
    }
  }
}