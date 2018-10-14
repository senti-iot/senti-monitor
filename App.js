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
		marginTop: 50,
		marginLeft: 10,
		marginRight: 10,
		backgroundColor: '#fff',
		// alignItems: 'center',
		justifyContent: 'flex-start',
	},
	header: {
		backgroundColor: '#BFFC12',
		fontSize: 28
	}
})

class App extends React.Component {
	constructor(props) {
		super(props)

		const client = new Paho.MQTT.Client('hive.senti.cloud', 8083, 'senti-monitor')
		client.onConnectionLost = this.onConnectionLost
		client.onMessageArrived = this.onMessageArrived
		client.connect({ onSuccess: this.onConnect, useSSL: false, onFailure: this.onFailure })

		this.state = {
			text: '',
			client,
		}

		setInterval(() => {
			this.publish(client, 'senti/sensor/darwin/cb-pro.local/status', '{ "Text": "Senti Monitor says HI!" }', 1, false)
		}, 5000)

	}

	componentDidMount() {
		// const { client } = this.state
		// this.publish(client, 'senti/sensor/darwin/cb-pro.local/status', '{ "Text": "Senti Monitor says HI!" }', 1, false)
	}

	pushText = (entry) => {
		this.setState({ text: entry })
	}

	publish = (client, topic, payload, qos, retained) => {
		var message = new Paho.MQTT.Message(payload)
		message.destinationName = topic
		if (arguments.length >= 4) message.qos = qos
		if (arguments.length >= 5) message.retained = retained
		client.send(message)		
	}

	onFailure = () => {

	}

	onConnect = () => {
		const { client } = this.state
		client.subscribe('senti/sensor/darwin/cb-pro.local/status')
		this.pushText('connected')
		this.publish(client, 'senti/sensor/darwin/cb-pro.local/status', '{ "Text": "Senti Monitor says HI!" }', 1, false)
		// client.publish('senti/sensor/darwin/cb-pro.local/status', '{ "Text": "Senti Monitor says HI!" }', 1, false)
	}

	onConnectionLost = responseObject => {
		if (responseObject.errorCode !== 0) {
			this.pushText(`connection lost: ${responseObject.errorMessage}`)
		}
	}

	onMessageArrived = message => {
		const { client } = this.state
		const obj = JSON.parse(message.payloadString.toString())
		// console.log(obj.messageId)
		this.pushText(message.payloadString)
	}

	render() {
		const { text } = this.state;

		return (
			<View style={styles.container}>
				<Text style={styles.header}>Here comes the honey:</Text>
				<View>
					<Text>{this.state.text}</Text>
				</View>
			</View>
		)
	}
}

export default App