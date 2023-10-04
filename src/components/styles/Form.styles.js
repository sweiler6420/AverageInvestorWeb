import styles from "../../index.css"

export default {
  form_div: 'bg-background \
    shadow-2xl shadow-black/90 \
    dark:bg-background \
    flex flex-col justify-center',

  form_style: 'bg-background-sub \
    max-w-[400px] \
    outline outline-primary \
    dark:outline-none dark:shadow-neon-primary dark:bg-background-sub \
    w-full mx-auto p-8 rounded-lg',

  form_header: 'text-4xl text-text dark:text-text font-bold text-center',

  form_input_div: 'flex flex-col text-text dark:text-text py-2',

  form_input: 'rounded-lg \
    bg-background-sub dark:bg-background-sub \
    outline outline-primary dark:outline-none dark:shadow-neon-primary-sm focus:bg-background dark:focus:bg-background \
    mt-2 p-2 w-full',
  
  form_button: 'bg-primary \
    dark:bg-primary hover:bg-secondary dark:hover:bg-secondary \
    text-reverse-text dark:text-reverse-text hover:text-text dark:hover:text-text \
    w-full my-5 py-2 \
    font-semibold hover:font-semibold rounded-lg',
}