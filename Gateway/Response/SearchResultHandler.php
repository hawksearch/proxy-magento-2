<?php
/**
 *  Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *  IN THE SOFTWARE.
 */
declare(strict_types=1);

namespace HawkSearch\Proxy\Gateway\Response;

use HawkSearch\Connector\Gateway\Helper\HttpResponseReader;
use HawkSearch\Connector\Gateway\Http\Converter\JsonToArray;
use HawkSearch\Connector\Gateway\Http\ConverterException;
use HawkSearch\Connector\Gateway\Response\HandlerInterface;
use HawkSearch\Proxy\Api\Data\SearchResultDataInterface;

class SearchResultHandler implements HandlerInterface
{
    /**
     * @var HttpResponseReader
     */
    private $httpResponseReader;

    /**
     * @var JsonToArray
     */
    private $converter;

    /**
     * SearchResultHandler constructor.
     * @param HttpResponseReader $httpResponseReader
     * @param JsonToArray $converter
     */
    public function __construct(
        HttpResponseReader $httpResponseReader,
        JsonToArray $converter
    ) {
        $this->httpResponseReader = $httpResponseReader;
        $this->converter = $converter;
    }

    /**
     * Handles response
     *
     * @param array $handlingSubject
     * @param array $response
     * @return array
     */
    public function handle(array $handlingSubject, array $response)
    {
        $searchResults = $this->httpResponseReader->readResponseData($response);

        //unserialize values
        $results = &$searchResults['Data'][SearchResultDataInterface::RESULTS];
        $featuredItems = &$searchResults['Data'][SearchResultDataInterface::FEATURED_ITEMS];

        try {
            $results = ($results !== null) ? $this->converter->convert($results) : [];
        } catch (ConverterException $e) {
            $results = [];
        } catch (\InvalidArgumentException $e) {
            $results = [];
        }

        try {
            $featuredItems = ($featuredItems !== null) ? $this->converter->convert($featuredItems) : [];
        } catch (ConverterException $e) {
            $featuredItems = [];
        } catch (\InvalidArgumentException $e) {
            $featuredItems = [];
        }

        return $searchResults;
    }
}
