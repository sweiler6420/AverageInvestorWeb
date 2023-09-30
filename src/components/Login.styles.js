import styles from "../index.css"

export default {
  login_div: [
    'grid',
    'grid-cols-1',
    'sm:grid-cols-2',
    'h-screen',
    'w-full'
  ].join(' '),
  login_img_div: [
    'hidden',
    'sm:block'
  ].join(' '),
  login_img: [
    'w-full',
    'h-full',
    'object-cover'
  ].join(' '),
  login_form_div: [
    'bg-gray-900',
    'flex flex-col',
    'justify-center',
    'shadow-2xl',
    'shadow-black/90'
  ].join(' '),
  login_form: 'max-w-[400px] w-full mx-auto bg-black p-8 rounded-lg',
  login_form_h2: 'text-4xl text-white font-bold text-center',
  login_form_label_input_div: 'flex flex-col text-gray-400 py-2',
  login_form_input: 'rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-black',
  login_form_submit_div: 'flex justify-between text-gray-400 py-2',
  login_form_button: 'w-full my-5 py-2 bg-teal-500 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/50 text-white font-semibold rounded-lg',
}