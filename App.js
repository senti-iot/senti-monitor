import React from 'react'
import { AsyncStorage, StyleSheet, Text, View } from 'react-native'
import init from 'react_native_mqtt'

init({
	size: 10000,
	storageBackend: AsyncStorage,
	defaultExpires: 1000 * 3600 * 24,
	enableCache: true,
	reconnect: true,
	sync: {
	}
})

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
})

class App extends React.Component {
	constructor(props) {
		super(props)

		const client = new Paho.MQTT.Client('hive.senti.cloud', 8083, 'senti-monitor')
		client.onConnectionLost = this.onConnectionLost
		client.onMessageArrived = this.onMessageArrived
		client.connect({ onSuccess: this.onConnect, useSSL: false })
		// client.connect({ onFailure: this.onFailure, useSSL: true })

		this.state = {
			text: '',
			client,
		}
	}

	pushText = (entry) => {
		// const { text } = this.state
		this.setState({ text: entry })
	}

	onConnect = () => {
		const { client } = this.state
		client.subscribe('senti/sensor/darwin/cb-pro.local/status')
		this.pushText('connected')
	}

	onConnectionLost = responseObject => {
		if (responseObject.errorCode !== 0) {
			this.pushText(`connection lost: ${responseObject.errorMessage}`)
		}
	}

	onMessageArrived = message => {
		const obj = JSON.parse(message.payloadString.toString())
		// console.log(obj.messageId)
		this.pushText(message.payloadString)
	}

	render() {
		const { text } = this.state;

		return (
			<View style={styles.container}>
				{/* {text.map(entry => <Text key='1'>{entry}</Text>)} */}
				<Text>{this.state.text}</Text>
			</View>
		)
	}
}

export default App