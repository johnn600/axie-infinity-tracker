# Axie Infinity Tracker

<div align="left">
  <strong>Proof-of-concept information system by John Rey Vilbar</strong><br>
  <strong>Requirement for ITD104 | Database Security, Admin & Management</strong><br>
  <strong>For educational purposes only</strong>
</div>

## Background

<p>The rise of decentralized transaction systems, powered by smart contracts on the blockchain, has sparked both excitement and controversy due to their volatility compared to traditional fiat economies. While this challenges the long-established fiat-based monetary model—recognized for its relative stability—the foundational ideas behind blockchain, particularly consensus mechanisms like Proof of Work and Proof of Stake, represent a groundbreaking shift in how resources can be managed without centralized control.</p>

<p>Axie Infinity, a popular blockchain-based game in the Philippines, leveraged cryptocurrency technology to create a new form of digital economy. Developed by Sky Mavis, the game enabled players to earn a tradeable cryptocurrency called Smooth Love Potion (SLP) by interacting with unique NFT creatures known as "Axies." These tokens could be exchanged for real money through major platforms like Binance. During the COVID-19 pandemic, Axie Infinity emerged as a significant source of alternative income for many Filipinos (Francisco et al., 2022). This led to the formation of numerous Axie guilds—organized groups aimed at maximizing earnings from gameplay—across the country.</p>

## System Overview (excerpt from the original documentation)

<p>The system was originally designed to cater the typical entities inside an Axie Guild, namely the <b>Manager</b> and the <b>Scholar</b>. The role Auditor will be implemented on future revisions of this information system. Manager is the person who is usually the prime investor of an Axie Guild (he/she purchases multiple axies to be played by the guild’s scholars). Likewise, the scholars are the ones who are selected by the manager, usually the ones who are qualified during interviews for application of Axie scholarships by the guild. Lastly, the auditor is the one who are tasked by the manager to make audits about the guild, report any irregularities among the data of the system.</p>

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Python (primarily with [Eel](https://github.com/python-eel/Eel), Bottle)
- **Database**: SQLite

Note: The system is designed to be run locally. It is not intended for deployment on a web server or cloud platform.<br>
<b>Recommended Python version is 3.11.x</b>

## Installation

1. Clone this repository to your local machine.

   ```bash
   git clone https://github.com/johnn600/axie-infinity-tracker.git
   ```

2. Install the required Python packages using pip:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the application using the following command:
   ```bash
   python app.py
   ```
   or you can run the `app.py` file directly in your IDE.
