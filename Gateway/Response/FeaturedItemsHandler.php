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

use HawkSearch\Connector\Gateway\Response\HandlerInterface;
use HawkSearch\Proxy\Api\Data\SearchResultDataInterface;

/**
 * Class FeaturedItemsHandler
 * This handler should be used after @see SearchResultHandler
 * @package HawkSearch\Proxy\Gateway\Response
 */
class FeaturedItemsHandler implements HandlerInterface
{
    /**
     * Handles response
     *
     * @param array $handlingSubject
     * @param array $response
     * @return array
     */
    public function handle(array $handlingSubject, array $response)
    {
        $featuredItems = &$response['Data'][SearchResultDataInterface::FEATURED_ITEMS];
        if ($featuredItems === null) {
            return $response;
        }

        if (isset($featuredItems['Items']['Items'])) {
            $featuredItems['Items'] = $featuredItems['Items']['Items'];
        }

        return $response;
    }
}
