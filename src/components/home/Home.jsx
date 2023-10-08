import React from 'react'
import Contact from './Contact'
import Hero from './Hero'
import Who from './Who'
import Works from './Works'
import styles from './Home.styles'
import styled from 'styled-components'

const Container = styled.div`
  scrollbar-width: none;
  &::-webkit-scrollbar{
    display: none;
  }
`

export default function Home() {
    return (
        // <div className={styles.home_div}>
        <Container style={{background:'url(' + require('../../assets/bg.jpeg') + ')'}} className={styles.home_div}>
            <Hero></Hero>
            <Who></Who>
            <Works></Works>
            <Contact></Contact>
        </Container>
    )
}